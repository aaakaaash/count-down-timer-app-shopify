//count-down-timer-app/app/db.server.js

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI not found");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    console.log("🟢 MongoDB already connected");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("🟡 MongoDB connecting...");

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "countdown_timer_app",
      })
      .then((mongoose) => {
        console.log("✅ MongoDB connected successfully");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection failed", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
