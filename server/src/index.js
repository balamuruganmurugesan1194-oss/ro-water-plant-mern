import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import compression from "compression";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import partyRoutes from "./routes/partyRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import productionRoutes from "./routes/productionRoutes.js";
import operationsRoutes from "./routes/operationsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

// app.use(cors());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8081",
      "https://my-mern-app.vercel.app",
      "https://ro-water-plant-mern.vercel.app",
    ],
    credentials: true,
  }),
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
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
  });
});

app.get("/api/health/ready", async (_, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    return res.json({ ok: true, database: "ready" });
  } catch (error) {
    return res.status(503).json({ ok: false, database: "unavailable", message: error.message });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/settings/users", userRoutes);
app.use("/api/settings/roles", roleRoutes);
app.use("/api/settings/permissions", permissionRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/operations", operationsRoutes);
app.use("/api/reports", reportRoutes);
app.use(errorHandler);
const port = process.env.PORT || 5000;

mongoose.connection.on("connected", () => console.log("MongoDB connected"));
mongoose.connection.on("disconnected", () => console.error("MongoDB disconnected"));
mongoose.connection.on("error", (error) => console.error("MongoDB error:", error.message));

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
