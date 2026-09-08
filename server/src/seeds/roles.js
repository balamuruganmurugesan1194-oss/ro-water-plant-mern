import Permission from "../models/Permission.js";
import Role from "../models/Role.js";

// ==========================================
// ROLE SEED DATA
// ==========================================

const roleDefinitions = [
  {
    name: "Admin",

    description: "Full access to all modules",

    permissions: ["*"],

    isSystemRole: true,

    isActive: true,
  },

  {
    name: "Manager",

    description: "Management access",

    permissions: [
      "dashboard.view",

      "products.view",
      "products.create",
      "products.edit",

      "sales.view",
      "sales.create",
      "sales.edit",

      "expenses.view",
      "expenses.create",
      "expenses.edit",

      "parties.view",
      "parties.create",
      "parties.edit",

      "inventory.view",
      "inventory.opening_stock",
      "inventory.adjustment",
      "inventory.ledger",

      "users.view",

      "roles.view",

      "settings.view",
    ],

    isSystemRole: true,

    isActive: true,
  },

  {
    name: "Staff",

    description: "Sales and basic operational access",

    permissions: [
      "products.view",

      "sales.view",
      "sales.create",

      "parties.view",
      "parties.create",

      "inventory.view",
    ],

    isSystemRole: true,

    isActive: true,
  },

  {
    name: "Accountant",

    description: "Accounting and financial access",

    permissions: [
      "dashboard.view",

      "sales.view",

      "expenses.view",
      "expenses.create",
      "expenses.edit",

      "parties.view",

      "products.view",
    ],

    isSystemRole: true,

    isActive: true,
  },

  {
    name: "Delivery",

    description: "Delivery and sales viewing access",

    permissions: [
      "sales.view",

      "parties.view",

      "products.view",

      "inventory.view",
    ],

    isSystemRole: true,

    isActive: true,
  },

  {
    name: "Production",

    description: "Production and inventory access",

    permissions: [
      "products.view",

      "inventory.view",
      "inventory.opening_stock",
      "inventory.adjustment",
      "inventory.ledger",
    ],

    isSystemRole: true,

    isActive: true,
  },

  {
    name: "Viewer",

    description: "Read-only application access",

    permissions: [
      "dashboard.view",

      "products.view",

      "sales.view",

      "expenses.view",

      "parties.view",

      "inventory.view",
    ],

    isSystemRole: true,

    isActive: true,
  },
];

// ==========================================
// SEED ROLES
// ==========================================

export const seedRoles = async () => {
  for (const definition of roleDefinitions) {
    let permissionIds = [];

    // ======================================
    // ALL PERMISSIONS
    // ======================================

    if (definition.permissions.includes("*")) {
      const allPermissions = await Permission.find({
        isActive: true,
      }).select("_id");

      permissionIds = allPermissions.map((permission) => permission._id);
    } else {
      // ====================================
      // SELECTED PERMISSIONS
      // ====================================

      const permissionDocuments = await Permission.find({
        key: {
          $in: definition.permissions,
        },

        isActive: true,
      }).select("_id key");

      permissionIds = permissionDocuments.map((permission) => permission._id);
    }

    // ======================================
    // CREATE / UPDATE ROLE
    // ======================================

    await Role.findOneAndUpdate(
      {
        name: definition.name,
      },
      {
        $set: {
          name: definition.name,

          description: definition.description,

          permissions: permissionIds,

          isSystemRole: definition.isSystemRole,

          isActive: definition.isActive,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    console.log(`✓ Role seeded: ${definition.name}`);
  }

  console.log("✓ All roles seeded successfully");
};
