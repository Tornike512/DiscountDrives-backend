import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    carModel: String,
    carLink: String,
    carYear: String,
    carPrice: String,
    carImage: String,
    createdAt: { type: Date, default: Date.now, expires: "7d" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("cars", carSchema);
