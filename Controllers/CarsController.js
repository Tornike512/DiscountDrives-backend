import carModel from "../Models/carModel.js";
import filterCars from "../utils/filterCars.js";

export const sendCarsData = async (req, res) => {
  try {
    const {
      manufacturer,
      model,
      min_year,
      max_year,
      min_price,
      max_price,
      next_page,
    } = req.query;

    const cars = await carModel
      .find(
        filterCars(
          manufacturer,
          model,
          min_year,
          max_year,
          min_price,
          max_price
        )
      )
      .skip(next_page)
      .limit(20);

    res.json({ cars });
  } catch (error) {
    console.error("Error filtering cars:", error);
    res.status(500).json({ error: "Failed to filter cars" });
  }
};

export const sendCarsLength = async (req, res) => {
  try {
    const pageLength = await carModel.countDocuments();
    res.status(200).json(pageLength);
  } catch (error) {
    res.status(404).json({ message: "Error Fetching Car's Count" });
  }
};
