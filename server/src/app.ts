import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { createTasksRouter } from "./routes/tasks";
import { notFound, errorHandler } from "./middleware/error";
import type { Server } from "socket.io";
import { requireAuth } from "./middleware/auth";
import { isAllowedDevOrigin } from "./config/cors";

export const createApp = (io: Server, clientOrigin: string) => {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => callback(null, isAllowedDevOrigin(origin, clientOrigin)),
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/tasks", requireAuth, createTasksRouter(io));

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
