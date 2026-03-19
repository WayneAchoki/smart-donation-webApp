// models/Request.js
import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  ngoName: { type: String, required: true },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  item: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Completed", "Denied"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Request", requestSchema);
