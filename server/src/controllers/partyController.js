import Party from "../models/Party.js";

// ==========================================
// GET PARTIES
// GET /api/parties
// ==========================================

export const getParties = async (req, res) => {
  try {
    const filter = req.query.type
      ? { type: req.query.type }
      : {};

    const parties = await Party.find(filter)
      .sort({ name: 1 })
      .limit(500);

    res.status(200).json(parties);
  } catch (error) {
    console.error(
      "GET PARTIES ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ==========================================
// CREATE PARTY
// POST /api/parties
// ==========================================

export const createParty = async (
  req,
  res
) => {
  try {
    const party = await Party.create(
      req.body
    );

    res.status(201).json(party);
  } catch (error) {
    console.error(
      "CREATE PARTY ERROR:",
      error
    );

    res.status(400).json({
      message: error.message,
    });
  }
};


// ==========================================
// DELETE PARTY
// DELETE /api/parties/:id
// ==========================================

export const deleteParty = async (
  req,
  res
) => {
  try {
    const party =
      await Party.findByIdAndDelete(
        req.params.id
      );

    if (!party) {
      return res.status(404).json({
        message: "Party not found",
      });
    }

    res.status(200).json({
      ok: true,
      message:
        "Party deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE PARTY ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};