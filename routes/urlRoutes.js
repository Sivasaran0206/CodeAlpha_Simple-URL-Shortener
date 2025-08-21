const express = require("express");
const router = express.Router();
const shortid = require("shortid");
const validUrl = require("valid-url");
const Url = require("../models/Url");

// POST /shorten - create a short URL
router.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;
  const baseUrl = process.env.BASE_URL;

  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).json("Invalid base URL");
  }

  if (!validUrl.isUri(longUrl)) {
    return res.status(401).json("Invalid long URL");
  }

  try {
    // Check if long URL already exists
    let url = await Url.findOne({ longUrl });
    if (url) return res.json(url);

    // Create new short URL
    const urlCode = shortid.generate();
    const shortUrl = `${baseUrl}/${urlCode}`;
    url = new Url({ longUrl, shortUrl, urlCode });
    await url.save();
    return res.json(url);
  } catch (err) {
    console.error(err);
    return res.status(500).json("Server Error");
  }
});

// GET /:code - redirect to the original URL
router.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOne({ urlCode: req.params.code });
    if (url) {
      return res.redirect(url.longUrl); // Redirect client to long URL
    } else {
      return res.status(404).json("No URL found");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json("Server Error");
  }
});

module.exports = router;
