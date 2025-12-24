// app/routes/proxy.api.timers.jsx
import { json } from "@remix-run/node";
import { connectDB } from "../db.server";
import Timer from "../models/Timer";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ timers: [] });
  }

  await connectDB();

  const timers = await Timer.getCurrentTimers(shop);

  return json({
    timers: timers.map(t => ({
      name: t.name,
      description: t.description,
      startDate: t.startDate,
      startTime: t.startTime,
      endDate: t.endDate,
      endTime: t.endTime,
      size: t.size,
      position: t.position,
      color: t.color,
      urgency: t.urgency,
    }))
  });
};
