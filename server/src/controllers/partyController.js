import Party from "../models/Party.js";
import Counter from "../models/counter.js";

// ==========================================
// GET PARTIES
// GET /api/parties
// ==========================================

export const getParties = async (req, res) => {
  try {
    const filter = req.query.type ? { type: req.query.type } : {};

    const parties = await Party.find(filter).sort({ code: 1 }).limit(500);

    res.status(200).json(parties);
  } catch (error) {
    console.error("GET PARTIES ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// CREATE PARTY
// POST /api/parties
// ==========================================

export const createParty = async (req, res) => {
  try {
    console.log("PARTY REQUEST:", req.body);

    const { type, name, contactNumber, address, since, notes } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!type || !["customer", "supplier"].includes(type)) {
      return res.status(400).json({
        field: "type",
        message: "Valid party type is required",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        field: "name",
        message: "Name is required",
      });
    }

    // ==========================================
    // NORMALIZE VALUES
    // ==========================================

    const normalizedName = name.trim();

    const normalizedContact = contactNumber?.trim() || "";

    const normalizedAddress = address?.trim() || "";

    // ==========================================
    // CONTACT NUMBER VALIDATION
    // Only validate when provided
    // ==========================================

    if (normalizedContact && !/^[6-9]\d{9}$/.test(normalizedContact)) {
      return res.status(400).json({
        field: "contactNumber",
        message: "Enter a valid 10-digit mobile number",
      });
    }

    // ==========================================
    // CHECK DUPLICATE MOBILE NUMBER
    // Same type only
    // ==========================================

    if (normalizedContact) {
      const existingContact = await Party.findOne({
        type,
        contactNumber: normalizedContact,
      });

      if (existingContact) {
        return res.status(409).json({
          field: "contactNumber",
          message: `Mobile number already exists for this ${type}`,
        });
      }
    }

    
    // ==========================================
    // GENERATE PARTY CODE
    // ==========================================

    const counterName = `party_${type}`;

    const counter = await Counter.findOneAndUpdate(
      {
        name: counterName,
      },
      {
        $inc: {
          seq: 1,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    const prefix = type === "customer" ? "CUS" : "SUP";

    const generatedCode = `${prefix}${String(counter.seq).padStart(4, "0")}`;

    console.log("GENERATED PARTY CODE:", generatedCode);

    // ==========================================
    // CREATE PARTY
    // ==========================================

    const party = await Party.create({
      type,

      code: generatedCode,

      name: normalizedName,

      contactNumber: normalizedContact,

      address: normalizedAddress,

      since,

      notes: notes?.trim() || "",
    });

    console.log("PARTY CREATED:", party);

    return res.status(201).json(party);
  } catch (error) {
    console.error("CREATE PARTY ERROR:", error);

    // ==========================================
    // DUPLICATE KEY
    // ==========================================

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      if (duplicateField === "contactNumber") {
        return res.status(409).json({
          field: "contactNumber",
          message: "Mobile number already exists for this party type",
        });
      }

      if (duplicateField === "code") {
        return res.status(409).json({
          field: "code",
          message: "Party code already exists",
        });
      }

      return res.status(409).json({
        message: "Party already exists",
      });
    }

    // ==========================================
    // SERVER ERROR
    // ==========================================

    return res.status(500).json({
      message: "Failed to create party",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE PARTY
// DELETE /api/parties/:id
// ==========================================

export const deleteParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndDelete(req.params.id);

    if (!party) {
      return res.status(404).json({
        message: "Party not found",
      });
    }

    res.status(200).json({
      ok: true,
      message: "Party deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PARTY ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
export const getNextPartyCode = async (req, res) => {
  try {
    const { type } = req.query;

    if (!["customer", "supplier"].includes(type)) {
      return res.status(400).json({
        message: "Invalid party type",
      });
    }

    const counter = await Counter.findOne({
      name: `party_${type}`,
    });

    const nextSeq = (counter?.seq || 0) + 1;

    const prefix = type === "customer" ? "CUS" : "SUP";

    const code = `${prefix}${String(nextSeq).padStart(4, "0")}`;

    return res.json({
      code,
    });
  } catch (error) {
    console.error("NEXT PARTY CODE ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch next party code",
    });
  }
};
