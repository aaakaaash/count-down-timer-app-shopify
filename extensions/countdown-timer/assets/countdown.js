(() => {

  const container = document.querySelector(".countdown-timer");
  if (!container) {
    console.error("❌ .countdown-timer element not found in DOM");
    return;
  }

  const shop = container.dataset.shop;

  const display = container.querySelector(".countdown-time");
  const text = container.querySelector(".countdown-text");

  if (!display) {
    console.error("❌ .countdown-time element not found");
    return;
  }
  if (!text) {
    console.error("❌ .countdown-text element not found");
    return;
  }

const API_URL = `/apps/count-down-timer/api/timers?shop=${shop}`;

  
  console.log("🌐 API URL:", API_URL);

  function parseDateTime(date, time) {
    const dt = new Date(`${date}T${time}:00`);
    console.log(`📅 Parsed ${date} ${time} → ${dt.toISOString()}`);
    return dt.getTime();
  }

  function applyTimerStyles(timer) {
    console.log("🎨 Applying styles for timer:", timer.name);

    // Apply size
    const sizeMap = {
      small: { fontSize: "14px", padding: "8px 12px" },
      medium: { fontSize: "16px", padding: "10px 14px" },
      large: { fontSize: "20px", padding: "14px 20px" }
    };
    const size = sizeMap[timer.size] || sizeMap.medium;
    container.style.fontSize = size.fontSize;
    container.style.padding = size.padding;
    console.log(`  ↳ Size: ${timer.size} → ${size.fontSize}`);

    // Apply position
    if (timer.position === "top") {
      container.style.position = "sticky";
      container.style.top = "0";
      container.style.zIndex = "999";
      console.log("  ↳ Position: sticky top");
    } else {
      container.style.position = "fixed";
      container.style.bottom = "0";
      container.style.left = "0";
      container.style.right = "0";
      container.style.zIndex = "999";
      console.log("  ↳ Position: fixed bottom");
    }

    // Apply color
    if (timer.color) {
      container.style.backgroundColor = timer.color;
      // Auto-calculate text color for contrast
      const rgb = parseInt(timer.color.slice(1), 16);
      const brightness = ((rgb >> 16) * 299 + ((rgb >> 8) & 255) * 587 + (rgb & 255) * 114) / 1000;
      container.style.color = brightness > 128 ? "#000" : "#fff";
      console.log(`  ↳ Color: ${timer.color} (text: ${container.style.color})`);
    }

    // Show description
    if (timer.description) {
      text.textContent = `${timer.description} - Ends in: `;
      console.log(`  ↳ Description: ${timer.description}`);
    }
  }

  function startCountdown(timer) {
    console.log("⏱️ Starting countdown for:", timer.name);
    
    const startAt = parseDateTime(timer.startDate, timer.startTime);
    const endAt = parseDateTime(timer.endDate, timer.endTime);
    const now = Date.now();

    console.log("📊 Timer Schedule:");
    console.log(`  ↳ Start: ${new Date(startAt).toLocaleString()}`);
    console.log(`  ↳ End: ${new Date(endAt).toLocaleString()}`);
    console.log(`  ↳ Now: ${new Date(now).toLocaleString()}`);
    console.log(`  ↳ Is Active: ${now >= startAt && now <= endAt}`);

    function update() {
      const now = Date.now();

      // Not started yet
      if (now < startAt) {
        console.log("⏳ Timer not started yet");
        container.style.display = "none";
        return;
      }

      const remaining = endAt - now;

      // Expired
      if (remaining <= 0) {
        console.log("⏰ Timer expired");
        container.style.display = "none";
        clearInterval(interval);
        return;
      }

      // Show timer
      container.style.display = "block";

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining / (1000 * 60)) % 60);
      const seconds = Math.floor((remaining / 1000) % 60);

      display.textContent =
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;

      // Urgency mode - last 5 minutes
      if (remaining <= 5 * 60 * 1000) {
        if (!container.classList.contains("urgency")) {
          console.log("⚠️ Urgency mode activated!");
          container.classList.add("urgency");
        }
        
        // Apply urgency animation based on settings
        if (timer.urgency === "pulse") {
          container.style.animation = "pulse 1s infinite";
        } else if (timer.urgency === "blink") {
          container.style.animation = "blink 0.5s infinite";
        }
      }
    }

    update();
    const interval = setInterval(update, 1000);
  }

  // Fetch and start timer
  console.log("🌐 Fetching timers from API...");
  
  fetch(API_URL)
    .then(res => {
      console.log(`📥 API Response Status: ${res.status} ${res.statusText}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("📦 API Response Data:", data);
      
      if (!data.timers) {
        console.error("❌ No 'timers' property in response");
        container.style.display = "none";
        return;
      }

      if (data.timers.length === 0) {
        console.log("ℹ️ No active timers found");
        container.style.display = "none";
        return;
      }

      console.log(`✅ Found ${data.timers.length} timer(s)`);
      
      // Use first active timer
      const timer = data.timers[0];
      console.log("🎯 Using timer:", timer);
      
      applyTimerStyles(timer);
      startCountdown(timer);
    })
    .catch(err => {
      console.error("❌ Countdown timer error:", err);
      console.error("Stack trace:", err.stack);
      container.style.display = "none";
    });

  // Show initial state
  console.log("👁️ Initial container visibility:", window.getComputedStyle(container).display);
})();