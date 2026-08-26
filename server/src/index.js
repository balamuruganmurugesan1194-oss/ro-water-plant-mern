import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import partyRoutes from "./routes/partyRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

// app.use(cors());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://my-mern-app.vercel.app"
    ],
    credentials: true
  })
);
app.use(express.json());


// Root route
app.get("/", (_, res) => {
  res.json({
    message: "RO Water Plant API is running",
  });
});

// Health check
app.get("/api/health", (_, res) => {
  res.json({
    ok: true,
    service: "ro-water-plant-api",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`API running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });