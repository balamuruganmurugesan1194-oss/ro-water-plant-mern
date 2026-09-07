import Permission from "../models/Permission.js";

export const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find({
      isActive: true,
    }).sort({
      module: 1,
      name: 1,
    });

    res.json(permissions);
  } catch (error) {
    console.error("Get permissions error:", error);

    res.status(500).json({
      message: "Failed to load permissions",
    });
  }
};

export const createPermission = async (req, res) => {
  try {
    const { key, name, module, description = "" } = req.body;

    if (!key || !name || !module) {
      return res.status(400).json({
        message: "Key, name and module are required",
      });
    }

    const existing = await Permission.findOne({ key });

    if (existing) {
      return res.status(409).json({
        message: "Permission already exists",
      });
    }

    const permission = await Permission.create({
      key: key.trim(),
      name: name.trim(),
      module: module.trim(),
      description: description.trim(),
    });

    res.status(201).json(permission);
  } catch (error) {
    console.error("Create permission error:", error);

    res.status(500).json({
      message: "Failed to create permission",
    });
  }
};
