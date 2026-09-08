import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";

// =====================================================
// USER SEED DATA
// =====================================================
//
// role:
//   - null for Super Administrator
//   - Role name for normal users
//
// Passwords are hashed before inserting.
// =====================================================

const users = [
  {
    name: "Administrator",
    email: "admin@rowater.local",
    password: "Admin@123",

    // Administrator does not need a Role
    role: null,

    isSuperAdmin: true,
    isActive: true,
    isDefault: true,
  },

//   {
//     name: "Sales Staff",
//     email: "staff@rowater.local",
//     password: "Staff@123",

//     // Role name - converted to ObjectId during seed
//     role: "Staff",

//     isSuperAdmin: false,
//     isActive: true,
//     isDefault: false,
//   },

  // ---------------------------------------------------
  // You can add more default users here
  // ---------------------------------------------------

  // {
  //   name: "Manager",
  //   email: "manager@rowater.local",
  //   password: "Manager@123",
  //   role: "Manager",
  //   isSuperAdmin: false,
  //   isActive: true,
  //   isDefault: true,
  // },

  // {
  //   name: "Accountant",
  //   email: "accountant@rowater.local",
  //   password: "Accountant@123",
  //   role: "Accountant",
  //   isSuperAdmin: false,
  //   isActive: true,
  //   isDefault: true,
  // },

  // {
  //   name: "Delivery Staff",
  //   email: "delivery@rowater.local",
  //   password: "Delivery@123",
  //   role: "Delivery",
  //   isSuperAdmin: false,
  //   isActive: true,
  //   isDefault: true,
  // },

  // {
  //   name: "Production Staff",
  //   email: "production@rowater.local",
  //   password: "Production@123",
  //   role: "Production",
  //   isSuperAdmin: false,
  //   isActive: true,
  //   isDefault: true,
  // },
];

// =====================================================
// SEED USERS
// =====================================================

export const seedUsers = async () => {
  console.log("");
  console.log("=================================");
  console.log("Seeding users...");
  console.log("=================================");

  for (const userData of users) {
    try {
      let roleId = null;

      // =================================================
      // FIND ROLE
      // =================================================

      if (userData.role) {
        const role = await Role.findOne({
          name: userData.role,
          isActive: true,
        });

        if (!role) {
          throw new Error(
            `Role "${userData.role}" not found for ${userData.email}`,
          );
        }

        roleId = role._id;
      }

      // =================================================
      // HASH PASSWORD
      // =================================================

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // =================================================
      // INSERT / UPDATE USER
      // =================================================

      const user = await User.findOneAndUpdate(
        {
          email: userData.email.toLowerCase(),
        },
        {
          $set: {
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: hashedPassword,

            // ObjectId or null
            role: roleId,

            isSuperAdmin: userData.isSuperAdmin === true,

            isActive: userData.isActive !== false,

            isDefault: userData.isDefault === true,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      console.log(`✓ User seeded: ${user.name} (${user.email})`);
    } catch (error) {
      console.error(`✗ Failed to seed user: ${userData.email}`);

      throw error;
    }
  }

  // =====================================================
  // DISPLAY USERS
  // =====================================================

  const seededUsers = await User.find()
    .populate("role", "name description isActive")
    .select("name email role isSuperAdmin isActive isDefault")
    .sort({
      createdAt: 1,
    });

  console.log("");
  console.log("=================================");
  console.log("USERS");
  console.log("=================================");

  seededUsers.forEach((user) => {
    console.log({
      name: user.name,
      email: user.email,
      role: user.role?.name || null,
      isSuperAdmin: user.isSuperAdmin,
      isActive: user.isActive,
      isDefault: user.isDefault,
    });
  });

  console.log("");
  console.log(`Total users: ${seededUsers.length}`);

  return seededUsers;
};

export default users;
