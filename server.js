import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import Post from "./models/Post.js";
import dns from "dns"

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5000",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// category redirect
app.get("/category.html", (req, res) => {
  const { cat } = req.query;

  if (cat) {
    return res.redirect(301, `/blog/${encodeURIComponent(cat)}`);
  }

  return res.redirect(301, "/blog");
});

// sitemap.xml route
app.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = "https://blog.lvstwebdev.com";

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
        lastmod: new Date(post.updatedAt || post.createdAt || Date.now()).toISOString(),
        priority: "0.80",
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
  http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map((url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Could not generate sitemap");
  }
});


app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard", dashboardRoutes);

  
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/blog", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "blog.html"));
});

app.get("/blog/:cat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "blog.html"));
});

app.get("/post/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "post.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

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

app.get("/about.html", (req, res) => {
  return res.redirect(301, "/about");
});

app.get("/category.html/:cat", (req, res) => {
  return res.redirect(301, `/blog/${encodeURIComponent(req.params.cat)}`);
}); 

app.get("/category/:cat", (req, res) => {
  return res.redirect(301, `/blog/${encodeURIComponent(req.params.cat)}`);
});

app.get("/category", (req, res) => {
  return res.redirect(301, "/blog");
});

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });