const permissions = [
  // ==========================================
  // DASHBOARD
  // ==========================================

  {
    key: "dashboard.view",
    name: "View Dashboard",
    module: "Dashboard",
    description: "View dashboard and business summary",
  },

  // ==========================================
  // PRODUCTS
  // ==========================================

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

  // ==========================================
  // SALES
  // ==========================================

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

  // ==========================================
  // EXPENSES
  // ==========================================

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

  // ==========================================
  // PARTIES
  // ==========================================

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

  // ==========================================
  // INVENTORY
  // ==========================================

  {
    key: "inventory.view",
    name: "View Inventory",
    module: "Inventory",
  },

  {
    key: "inventory.opening_stock",
    name: "Manage Opening Stock",
    module: "Inventory",
  },

  {
    key: "inventory.adjustment",
    name: "Manage Stock Adjustment",
    module: "Inventory",
  },

  {
    key: "inventory.ledger",
    name: "View Stock Ledger",
    module: "Inventory",
  },

  // ==========================================
  // USERS
  // ==========================================

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

  // ==========================================
  // ROLES
  // ==========================================

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

  // ==========================================
  // SETTINGS
  // ==========================================

  {
    key: "settings.view",
    name: "View Settings",
    module: "Settings",
  },

  {
    key: "settings.manage",
    name: "Manage Settings",
    module: "Settings",
  },
];

export default permissions;
