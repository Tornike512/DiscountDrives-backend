import mongoose from "mongoose";

const CarModelSchemaMongoose = new mongoose.Schema({
  model: String,
  prices_by_year: Map,
});

const CarPricesSchemaMongoose = new mongoose.Schema({
  jeep: [CarModelSchemaMongoose],
  arcfox: [CarModelSchemaMongoose],
  acura: [CarModelSchemaMongoose],
});

export default mongoose.model("carPrices", CarPricesSchemaMongoose);
