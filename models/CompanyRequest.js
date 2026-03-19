// models/CompanyRequest.js
import mongoose from "mongoose";

const companyRequestSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // --- NEW FIELDS ---
    companyName: { type: String },
    licenseNumber: { type: String },
    location: { type: String },
    founderName: { type: String },
    verificationDocs: [String], // array of file paths

    type: {
      type: String,
      enum: ["donation", "partnership", "csr"],
      required: true,
    },
    amount: Number,
    items: [String],
    message: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("CompanyRequest", companyRequestSchema);
