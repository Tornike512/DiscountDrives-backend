import carModel from "../Models/carModel.js";

export const sendCarsData = async (req, res) => {
  const { firstCar, lastCar } = req.query;

  try {
    const cars = await carModel
      .find()
      .sort({ _id: -1 })
      .skip(firstCar)
      .limit(lastCar);

    if (!cars || cars.length === 0) {
      return res.status(404).json({ message: "No cars were found" });
    }
    res.status(200).json({ cars });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ message: "Server error" });
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
