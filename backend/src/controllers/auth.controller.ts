import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import "dotenv/config";
import {generateToken} from "../utils/jwt";


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });



export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Validate required fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a resident account awaiting manager approval
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone:
          typeof phone === "string" && phone.trim()
            ? phone.trim()
            : null,
        address:
          typeof address === "string" && address.trim()
            ? address.trim()
            : null,

        // Never accept roles or account status from public registration
        role: "FACILITY_USER",
        status: "PENDING",
      },
    });

    // Never return the password
    const { password: _, ...safeUser } = user;

    return res.status(201).json({
      message:
        "Registration successful. Your account is awaiting Facility Manager approval.",
      user: safeUser,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "An error occurred during registration",
    });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

   if (user.status === "PENDING") {
  return res.status(403).json({
    message:
      "Your registration is awaiting approval from the Facility Manager.",
    status: "PENDING",
  });
}

if (user.status === "REJECTED") {
  return res.status(403).json({
    message:
      "Your registration was not approved. Please contact the Facility Manager.",
    status: "REJECTED",
  });
}

if (user.status === "INACTIVE") {
  return res.status(403).json({
    message: "Your account has been deactivated. Please contact the Facility Manager.",
    status: "INACTIVE",
  });
}

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user.id, user.role);

    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "An error occurred during login",
    });
  }
};