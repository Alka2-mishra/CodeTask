import mongoose from "mongoose";

export const connectDatabase = async (mongoUri?: string) => {
  await mongoose.connect(mongoUri ?? "mongodb://127.0.0.1:27017/codetask");
};
