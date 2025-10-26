// Example: express route that proxies a remote image.
// Install node-fetch or axios: npm i node-fetch@2
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/proxy-image", async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) return res.status(400).send("Missing url");

    // If the URL requires auth, include credentials or use Gmail API (see below).
    const response = await fetch(imageUrl, {
      // If basic public image: no headers needed.
      // If Google requires auth, you must include a valid Authorization header here (see Gmail API method).
      // headers: { Authorization: `Bearer ${process.env.GMAIL_OAUTH_TOKEN}` }
    });

    if (!response.ok) return res.status(response.status).send("Upstream error");

    // forward content-type
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    // Allow your front-end origin to read this response
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    // Stream the body
    (response.body as any).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
});

export default router;
