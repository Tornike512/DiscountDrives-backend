import mongoose from "mongoose";

const carYearSchema = new mongoose.Schema({
  year: String,
  price: String,
});

const CarModelSchema = new mongoose.Schema({
  model: String,
  prices_by_year: [carYearSchema],
});

const CarPricesSchema = new mongoose.Schema({
  brand: String,
  models: [CarModelSchema],
});

export default mongoose.model("carprices", CarPricesSchema);
