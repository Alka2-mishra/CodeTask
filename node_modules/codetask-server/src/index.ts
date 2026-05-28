import http from "http";
import { createApp } from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { createSocketServer } from "./sockets";

const start = async () => {
  await connectDatabase(env.mongoUri);

  const server = http.createServer();
  const io = createSocketServer(server, env.clientOrigin);
  const app = createApp(io, env.clientOrigin);

  server.removeAllListeners("request");
  server.on("request", app);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${env.port}`);
  });
};

void start();
