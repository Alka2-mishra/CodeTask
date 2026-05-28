import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { env } from "./config/env";
import { isAllowedDevOrigin } from "./config/cors";

interface SocketTokenPayload {
  userId: string;
}

export const createSocketServer = (server: HttpServer, clientOrigin: string) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => callback(null, isAllowedDevOrigin(origin, clientOrigin)),
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error("Missing auth token"));
    }

    try {
      const payload = jwt.verify(token, env.jwtSecret) as SocketTokenPayload;
      socket.data.userId = payload.userId;
      return next();
    } catch {
      return next(new Error("Invalid auth token"));
    }
  });

  io.on("connection", socket => {
    socket.join(socket.data.userId);
  });

  return io;
};
