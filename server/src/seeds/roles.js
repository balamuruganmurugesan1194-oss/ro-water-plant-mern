import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

const roles = [
  {
    name: "Admin",
    description: "Full system access",
    permissionMode: "all",
  },

  {
    name: "Manager",
    description: "Plant and business management access",
    permissionKeys: [
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
    ],
  },

  {
    name: "Staff",
    description: "Daily operational access",
    permissionKeys: [
      "products.view",

      "sales.view",
      "sales.create",

      "parties.view",
      "parties.create",

      "inventory.view",
    ],
  },

  {
    name: "Accountant",
    description: "Finance and accounting access",
    permissionKeys: [
      "dashboard.view",

      "sales.view",

      "expenses.view",
      "expenses.create",
      "expenses.edit",

      "parties.view",

      "products.view",
    ],
  },

  {
    name: "Delivery",
    description: "Delivery operation access",
    permissionKeys: [
      "sales.view",
      "parties.view",
      "products.view",
      "inventory.view",
    ],
  },

  {
    name: "Production",
    description: "RO production and inventory access",
    permissionKeys: [
      "products.view",
      "inventory.view",
      "inventory.opening_stock",
      "inventory.adjustment",
      "inventory.ledger",
    ],
  },

  {
    name: "Viewer",
    description: "Read-only access",
    permissionKeys: [
      "dashboard.view",
      "products.view",
      "sales.view",
      "expenses.view",
      "parties.view",
      "inventory.view",
    ],
  },
];

export const seedRoles = async () => {
  const permissions = await Permission.find({
    isActive: true,
  });

  const permissionMap = new Map(
    permissions.map((permission) => [permission.key, permission._id]),
  );

  for (const roleData of roles) {
    let permissionIds = [];

    if (roleData.permissionMode === "all") {
      permissionIds = permissions.map((permission) => permission._id);
    } else {
      permissionIds = (roleData.permissionKeys || [])
        .map((key) => permissionMap.get(key))
        .filter(Boolean);
    }

    await Role.findOneAndUpdate(
      {
        name: roleData.name,
      },
      {
        $set: {
          description: roleData.description,

          permissions: permissionIds,

          isSystemRole: true,

          isActive: true,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
  }

  console.log("Roles seeded successfully");
};
