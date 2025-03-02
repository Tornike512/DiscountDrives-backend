import mongoose from "mongoose";

const CarModelSchema = new mongoose.Schema({
  model: String,
  prices_by_year: {
    type: Map,
    of: String,
  },
});

const CarPricesSchema = new mongoose.Schema({
  brand: String,
  models: [CarModelSchema],
});

export default mongoose.model("carprices", CarPricesSchema);
