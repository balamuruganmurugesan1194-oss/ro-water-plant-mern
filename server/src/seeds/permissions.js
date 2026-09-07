import Permission from "../models/Permission.js";

const permissions = [
  // Dashboard
  {
    key: "dashboard.view",
    name: "View Dashboard",
    module: "Dashboard",
  },

  // Products
  {
    key: "products.view",
    name: "View Products",
    module: "Products",
  },
  {
    key: "products.create",
    name: "Create Products",
    module: "Products",
  },
  {
    key: "products.edit",
    name: "Edit Products",
    module: "Products",
  },
  {
    key: "products.delete",
    name: "Delete Products",
    module: "Products",
  },

  // Sales
  {
    key: "sales.view",
    name: "View Sales",
    module: "Sales",
  },
  {
    key: "sales.create",
    name: "Create Sales",
    module: "Sales",
  },
  {
    key: "sales.edit",
    name: "Edit Sales",
    module: "Sales",
  },
  {
    key: "sales.delete",
    name: "Delete Sales",
    module: "Sales",
  },

  // Expenses
  {
    key: "expenses.view",
    name: "View Expenses",
    module: "Expenses",
  },
  {
    key: "expenses.create",
    name: "Create Expenses",
    module: "Expenses",
  },
  {
    key: "expenses.edit",
    name: "Edit Expenses",
    module: "Expenses",
  },
  {
    key: "expenses.delete",
    name: "Delete Expenses",
    module: "Expenses",
  },

  // Parties
  {
    key: "parties.view",
    name: "View Parties",
    module: "Parties",
  },
  {
    key: "parties.create",
    name: "Create Parties",
    module: "Parties",
  },
  {
    key: "parties.edit",
    name: "Edit Parties",
    module: "Parties",
  },
  {
    key: "parties.delete",
    name: "Delete Parties",
    module: "Parties",
  },

  // Inventory
  {
    key: "inventory.view",
    name: "View Inventory",
    module: "Inventory",
  },
  {
    key: "inventory.opening_stock",
    name: "Opening Stock",
    module: "Inventory",
  },
  {
    key: "inventory.adjustment",
    name: "Stock Adjustment",
    module: "Inventory",
  },
  {
    key: "inventory.ledger",
    name: "Stock Ledger",
    module: "Inventory",
  },

  // Users
  {
    key: "users.view",
    name: "View Users",
    module: "Users",
  },
  {
    key: "users.create",
    name: "Create Users",
    module: "Users",
  },
  {
    key: "users.edit",
    name: "Edit Users",
    module: "Users",
  },
  {
    key: "users.delete",
    name: "Delete Users",
    module: "Users",
  },

  // Roles
  {
    key: "roles.view",
    name: "View Roles",
    module: "Roles",
  },
  {
    key: "roles.create",
    name: "Create Roles",
    module: "Roles",
  },
  {
    key: "roles.edit",
    name: "Edit Roles",
    module: "Roles",
  },
  {
    key: "roles.delete",
    name: "Delete Roles",
    module: "Roles",
  },

  // Settings
  {
    key: "settings.view",
    name: "View Settings",
    module: "Settings",
  },
];

export default permissions;
