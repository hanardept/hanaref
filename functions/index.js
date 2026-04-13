const functions = require("firebase-functions");
const fs = require("fs");
const path = require("path");

exports.geoGatekeeper = functions.https.onRequest((req, res) => {
  // Grab the real header (which is undefined locally)
  let countryCode = req.headers["x-appengine-country"];

   // Allow if the country is Israel ('IL') OR if the header is missing (local dev)
  if (countryCode === "IL" || !countryCode) { 
    try {
      // Read the React HTML file natively and send it to the user
      const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
      res.status(200).send(html);
    } catch (e) {
      functions.logger.error("Missing index.html. Did you copy it after building?", e);
      res.status(500).send("Internal Server Error: Could not find React app.");
    }
  } else {
    // Drop all non-Israel traffic
    res.status(403).send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1>Access Denied</h1>
        <p>This system is restricted to users located in Israel.</p>
      </div>
    `);
  }
});