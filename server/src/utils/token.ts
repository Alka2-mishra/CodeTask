import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const createAuthToken = (userId: string) =>
  jwt.sign({ userId }, env.jwtSecret, { expiresIn: "7d" });
