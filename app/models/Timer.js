import mongoose from "mongoose";
import { connectDB } from "../db.server.js";

const timerSchema = new mongoose.Schema(
  {
    shop: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    startDate: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },
    position: {
      type: String,
      enum: ["top", "bottom"],
      default: "top",
    },
    urgency: {
      type: String,
      enum: ["none", "pulse", "blink"],
      default: "pulse",
    },
    color: {
      type: String,
      default: "#00ff00",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for shop queries
timerSchema.index({ shop: 1, createdAt: -1 });

// Virtual field to calculate status
timerSchema.virtual("status").get(function () {
  const now = new Date();
  const start = new Date(`${this.startDate}T${this.startTime}`);
  const end = new Date(`${this.endDate}T${this.endTime}`);

  if (now < start) return "scheduled";
  if (now > end) return "ended";
  return "active";
});

// Ensure virtuals are included in JSON
timerSchema.set("toJSON", { virtuals: true });
timerSchema.set("toObject", { virtuals: true });

// Static methods
timerSchema.statics.findByShop = function (shop) {
  return this.find({ shop }).sort({ createdAt: -1 });
};

timerSchema.statics.findActiveByShop = function (shop) {
  return this.find({ shop, isActive: true }).sort({ createdAt: -1 });
};

timerSchema.statics.createTimer = async function (shop, timerData) {
  console.log("🟢 Creating timer for shop:", shop);
  console.log("🟢 Timer data:", timerData);
  
  const timer = new this({
    shop,
    ...timerData,
  });
  
  const saved = await timer.save();
  console.log("✅ Timer saved with ID:", saved._id);
  return saved;
};

timerSchema.statics.updateTimer = async function (timerId, timerData) {
  return await this.findByIdAndUpdate(timerId, timerData, {
    new: true,
    runValidators: true,
  });
};

timerSchema.statics.deleteTimer = async function (timerId) {
  return await this.findByIdAndDelete(timerId);
};

// Get current active timers for storefront
timerSchema.statics.getCurrentTimers = async function (shop) {
  const now = new Date();
  const timers = await this.find({ shop, isActive: true });

  return timers.filter((timer) => {
    const start = new Date(`${timer.startDate}T${timer.startTime}`);
    const end = new Date(`${timer.endDate}T${timer.endTime}`);
    return now >= start && now <= end;
  });
};

const Timer = mongoose.models.Timer || mongoose.model("Timer", timerSchema);

export default Timer;
