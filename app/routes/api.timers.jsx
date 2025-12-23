import { connectDB } from "../db.server.js";
import Timer from "../models/Timer.js";

// Public API endpoint - no authentication required
// This will be called by the widget on the storefront
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return new Response(
      JSON.stringify({ error: "Shop parameter is required" }), 
      { 
        status: 400,
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
  }

  try {
    // Connect to MongoDB
    await connectDB();
    
    // Get currently active timers for this shop
    const timers = await Timer.getCurrentTimers(shop);

    return new Response(
      JSON.stringify({
        timers: timers.map((timer) => ({
          id: timer._id.toString(),
          name: timer.name,
          description: timer.description,
          startDate: timer.startDate,
          startTime: timer.startTime,
          endDate: timer.endDate,
          endTime: timer.endTime,
          size: timer.size,
          position: timer.position,
          urgency: timer.urgency,
        })),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Cache-Control": "public, max-age=60",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching timers:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch timers" }), 
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
  }
};