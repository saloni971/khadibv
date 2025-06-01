const mongoose = require("mongoose");

const customizationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  neckDesign: { type: String, required: true },
  sleeveLength: { type: String, required: true },
  kurtiLength: { type: String, required: true },
  fabricType: { type: String, default: "Khadi" },
  color: { type: String, required: true },
  colorName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Customization", customizationSchema);
