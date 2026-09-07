import "dotenv/config";
import mongoose from "mongoose";

import Permission from "../models/Permission.js";
import permissions from "./permissions.js";
import { seedRoles } from "./roles.js";

/*
|--------------------------------------------------------------------------
| Seed Database
|--------------------------------------------------------------------------
*/

const seed = async () => {
  try {
    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    /*
    |--------------------------------------------------------------------------
    | Seed Permissions
    |--------------------------------------------------------------------------
    */

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

    console.log(`Permissions seeded: ${permissions.length}`);

    /*
    |--------------------------------------------------------------------------
    | Seed Roles
    |--------------------------------------------------------------------------
    */

    await seedRoles();

    console.log("Roles seeded successfully");

    /*
    |--------------------------------------------------------------------------
    | Finish
    |--------------------------------------------------------------------------
    */

    await mongoose.connection.close();

    console.log("Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Database seed failed:", error);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error("Failed to close MongoDB connection:", closeError.message);
    }

    process.exit(1);
  }
};

seed();
