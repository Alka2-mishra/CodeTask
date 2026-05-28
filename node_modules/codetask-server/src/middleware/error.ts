import { Request, Response, NextFunction } from "express";

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found." });
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : "Unexpected server error.";
  const statusCode = message.toLowerCase().includes("validation") ? 400 : 500;

  res.status(statusCode).json({ message });
};
