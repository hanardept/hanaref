const { onRequest } = require("firebase-functions/v2/https");
const path = require("path");

exports.geoGatekeeper = onRequest((req, res) => {
  // קריאת הכותרת הגיאוגרפית שפיירבייס מזריק אוטומטית לבקשה
  const country = req.headers["x-appengine-country"] || "Unknown";

  // IL = ישראל. Unknown = מאפשר בדיקות מקומיות או מצבים שבהם לא זוהתה מדינה
  if (country === "IL" || country === "Unknown") {
    // הכל תקין, מגישים את קובץ האתר
    res.sendFile(path.join(__dirname, "index.html"));
  } else {
    // חסימה מוחלטת
    res.status(403).send(`
      <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
        <h1>Access Denied (403)</h1>
        <p>This service is not available in your region (${country}).</p>
      </div>
    `);
  }
}); 