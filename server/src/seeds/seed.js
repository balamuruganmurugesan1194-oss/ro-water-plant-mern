import "dotenv/config";
import mongoose from "mongoose";

import Permission from "../models/Permission.js";
import Role from "../models/Role.js";

import permissions from "./permissions.js";
import { seedRoles } from "./roles.js";
import { seedUsers } from "./users.js";

// =====================================================
// DATABASE SEED
// =====================================================

const seed = async () => {
  try {
    // =================================================
    // CHECK ENVIRONMENT
    // =================================================

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured in .env");
    }

    // =================================================
    // CONNECT DATABASE
    // =================================================

    await mongoose.connect(process.env.MONGO_URI);

    console.log("");
    console.log("=================================");
    console.log("MongoDB connected");
    console.log("=================================");

    // =================================================
    // 1. PERMISSIONS
    // =================================================

    console.log("");
    console.log("=================================");
    console.log("SEEDING PERMISSIONS");
    console.log("=================================");

    for (const permission of permissions) {
      await Permission.findOneAndUpdate(
        {
          key: permission.key,
        },
        {
          $set: {
            key: permission.key,
            name: permission.name,
            module: permission.module,
            description: permission.description || "",
            isActive: true,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );
    }

    console.log(`✓ Permissions seeded: ${permissions.length}`);

    // =================================================
    // 2. ROLES
    // =================================================

    console.log("");
    console.log("=================================");
    console.log("SEEDING ROLES");
    console.log("=================================");

    await seedRoles();

    console.log("✓ Roles seeded successfully");

    // =================================================
    // 3. USERS
    // =================================================

    console.log("");
    console.log("=================================");
    console.log("SEEDING USERS");
    console.log("=================================");

    await seedUsers();

    // =================================================
    // 4. DATABASE SUMMARY
    // =================================================

    const userCount = await mongoose.connection.db
      .collection("users")
      .countDocuments();

    const roleCount = await Role.countDocuments();

    const permissionCount = await Permission.countDocuments({
      isActive: true,
    });

    // =================================================
    // SUMMARY
    // =================================================

    console.log("");
    console.log("=================================");
    console.log("DATABASE SUMMARY");
    console.log("=================================");

    console.log(`Users       : ${userCount}`);

    console.log(`Roles       : ${roleCount}`);

    console.log(`Permissions : ${permissionCount}`);

    // =================================================
    // LOGIN DETAILS
    // =================================================

    console.log("");
    console.log("=================================");
    console.log("DEFAULT LOGIN DETAILS");
    console.log("=================================");

    console.log("");
    console.log("Administrator");
    console.log("-------------------------");
    console.log("Email      : admin@rowater.local");
    console.log("Password   : Admin@123");
    console.log("Role       : None");
    console.log("SuperAdmin : true");

    console.log("");
    console.log("Sales Staff");
    console.log("-------------------------");
    console.log("Email      : staff@rowater.local");
    console.log("Password   : Staff@123");
    console.log("Role       : Staff");
    console.log("SuperAdmin : false");

    // =================================================
    // SUCCESS
    // =================================================

    console.log("");
    console.log("=================================");
    console.log("DATABASE SEED COMPLETE");
    console.log("=================================");

    // =================================================
    // CLOSE DATABASE
    // =================================================

    await mongoose.connection.close();

    console.log("MongoDB connection closed");

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("=================================");
    console.error("DATABASE SEED FAILED");
    console.error("=================================");

    console.error(error);

    // =================================================
    // CLOSE DATABASE ON ERROR
    // =================================================

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error("Failed to close MongoDB connection:", closeError.message);
    }

    process.exit(1);
  }
};

// =====================================================
// RUN SEED
// =====================================================

seed();
