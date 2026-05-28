import { Router } from "express";
import { Types } from "mongoose";
import { Task } from "../models/Task";
import type { Server } from "socket.io";

const allowedStatuses = ["todo", "in-progress", "done"] as const;
const allowedPriorities = ["low", "medium", "high"] as const;

const parseTaskBody = (body: Record<string, unknown>) => ({
  title: String(body.title ?? "").trim(),
  description: String(body.description ?? "").trim(),
  status: allowedStatuses.includes(body.status as (typeof allowedStatuses)[number])
    ? (body.status as (typeof allowedStatuses)[number])
    : "todo",
  priority: allowedPriorities.includes(body.priority as (typeof allowedPriorities)[number])
    ? (body.priority as (typeof allowedPriorities)[number])
    : "medium",
  dueDate: body.dueDate ? new Date(String(body.dueDate)) : null
});

const emitTaskEvent = (io: Server, userId: string, event: string, task: unknown) => {
  io.to(userId).emit(event, task);
};

export const createTasksRouter = (io: Server) => {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const tasks = await Task.find({ userId: req.userId }).sort({ updatedAt: -1 });
      return res.json({ tasks });
    } catch (error) {
      return next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const { title, description, status, priority, dueDate } = parseTaskBody(req.body as Record<string, unknown>);

      if (!title) {
        return res.status(400).json({ message: "Task title is required." });
      }

      if (dueDate && Number.isNaN(dueDate.getTime())) {
        return res.status(400).json({ message: "Invalid due date." });
      }

      const task = await Task.create({
        userId: new Types.ObjectId(req.userId),
        title,
        description,
        status,
        priority,
        dueDate
      });

      emitTaskEvent(io, String(req.userId), "task:created", task);
      return res.status(201).json({ task });
    } catch (error) {
      return next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = parseTaskBody(req.body as Record<string, unknown>);

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid task id." });
      }

      const task = await Task.findOneAndUpdate(
        { _id: id, userId: req.userId },
        {
          title: updates.title,
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          dueDate: updates.dueDate
        },
        { new: true }
      );

      if (!task) {
        return res.status(404).json({ message: "Task not found." });
      }

      emitTaskEvent(io, String(req.userId), "task:updated", task);
      return res.json({ task });
    } catch (error) {
      return next(error);
    }
  });

  router.patch("/:id/status", async (req, res, next) => {
    try {
      const { id } = req.params;
      const status = req.body.status as string;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid task id." });
      }

      if (!allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
        return res.status(400).json({ message: "Invalid task status." });
      }

      const task = await Task.findOneAndUpdate(
        { _id: id, userId: req.userId },
        { status },
        { new: true }
      );

      if (!task) {
        return res.status(404).json({ message: "Task not found." });
      }

      emitTaskEvent(io, String(req.userId), "task:updated", task);
      return res.json({ task });
    } catch (error) {
      return next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid task id." });
      }

      const task = await Task.findOneAndDelete({ _id: id, userId: req.userId });
      if (!task) {
        return res.status(404).json({ message: "Task not found." });
      }

      emitTaskEvent(io, String(req.userId), "task:deleted", { id });
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  return router;
};
