import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { createAuthToken } from "../utils/token";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

const sanitizeUser = (user: { _id: unknown; name: string; email: string }) => ({
  id: String(user._id),
  name: user.name,
  email: user.email
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");

    if (!name || !email || password.length < 8) {
      return res.status(400).json({ message: "Name, email, and an 8 character password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    const token = createAuthToken(String(user._id));

    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = createAuthToken(String(user._id));
    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("name email");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
});
