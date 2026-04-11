import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dns from "dns";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import Post from "./models/Post.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const uploadsDir = path.join(__dirname, "uploads");
const baseUrl = process.env.CLIENT_ORIGIN || "https://blog.lvstwebdev.com";

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

app.get("/index.html", (req, res) => res.redirect(301, "/"));

app.get("/about.html", (req, res) => res.redirect(301, "/about"));

app.get("/blog.html", (req, res) => {
  const { cat } = req.query;
  if (cat) return res.redirect(301, `/blog/${encodeURIComponent(cat)}`);
  return res.redirect(301, "/blog");
});

app.get("/post.html", (req, res) => {
  const { slug } = req.query;
  if (!slug) return res.redirect(301, "/blog");
  return res.redirect(301, `/post/${encodeURIComponent(slug)}`);
});

app.get("/category.html", (req, res) => {
  const { cat } = req.query;
  if (cat) return res.redirect(301, `/blog/${encodeURIComponent(cat)}`);
  return res.redirect(301, "/blog");
});

app.get("/category/:cat", (req, res) => {
  return res.redirect(301, `/blog/${encodeURIComponent(req.params.cat)}`);
});

app.get("/category", (req, res) => {
  return res.redirect(301, "/blog");
});

app.get("/sitemap.xml", async (req, res) => {
  try {
    const posts = await Post.find(
      { published: true, slug: { $exists: true, $ne: "" } },
      "slug updatedAt createdAt"
    ).lean();

    const now = new Date().toISOString();

    const urls = [
      {
        loc: `${baseUrl}/`,
        lastmod: now,
        priority: "1.00",
      },
      {
        loc: `${baseUrl}/blog`,
        lastmod: now,
        priority: "0.90",
      },
      {
        loc: `${baseUrl}/about`,
        lastmod: now,
        priority: "0.80",
      },
      ...posts.map((post) => ({
        loc: `${baseUrl}/post/${post.slug}`,
        lastmod: new Date(
          post.updatedAt || post.createdAt || Date.now()
        ).toISOString(),
        priority: "0.80",
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
  http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.type("application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Could not generate sitemap");
  }
});

app.use(express.static(publicDir));
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/blog", (req, res) => {
  res.sendFile(path.join(publicDir, "blog.html"));
});

app.get("/blog/:cat", (req, res) => {
  res.sendFile(path.join(publicDir, "blog.html"));
});

app.get("/post/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({
      slug: req.params.slug,
      published: true,
    }).lean();

    if (!post) {
      return res.status(404).send("Post not found");
    }

    const plainText = String(post.content || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const description =
      (post.excerpt && post.excerpt.trim()) ||
      plainText.slice(0, 160) ||
      "Read this post on LVST Blog.";

    const image = post.image && /^https?:\/\//i.test(post.image)
      ? post.image
      : "https://res.cloudinary.com/dx5qmhmux/image/upload/q_auto/f_auto/v1775418481/file_00000000b9cc720e9cb2a61fc80fd836_yf1cvw.png";

    const postUrl = `${baseUrl}/post/${post.slug}`;
    const title = `${post.title} | LVST Blog`;

    res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(postUrl)}" />

  <meta property="og:title" content="${escapeHtml(post.title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${escapeHtml(postUrl)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(post.title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />

  <script>
    window.location.replace("/post.html?slug=${encodeURIComponent(post.slug)}");
  </script>
</head>
<body></body>
</html>`);
  } catch (error) {
    console.error("Dynamic OG route error:", error);
    res.status(500).send("Error loading post");
  }
});



app.get("/about", (req, res) => {
  res.sendFile(path.join(publicDir, "about.html"));
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

startServer();