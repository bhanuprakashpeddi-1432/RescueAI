import mongoose from "mongoose";
import { env } from "./env.js";
import { MongoMemoryServer } from "mongodb-memory-server";

export const connectDB = async () => {
  try {
    let uri = env.mongoUri;

    if (uri.includes("localhost") || uri.includes("127.0.0.1")) {
      console.log("Using MongoDB Memory Server for zero-config demo...");
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
