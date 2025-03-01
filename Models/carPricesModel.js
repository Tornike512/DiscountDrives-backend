import mongoose from "mongoose";

const PriceByYearSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      match: /^[0-9]{4}$/,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const CarModelSchemaMongoose = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
    },
    prices_by_year: {
      type: Map,
      of: String,
      required: true,
    },
  },
  { _id: false }
);

const CarBrandSchemaMongoose = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    match: /^[a-z_]+$/,
  },
  models: [CarModelSchemaMongoose],
});

export default mongoose.model("CarPrice", CarBrandSchemaMongoose);
