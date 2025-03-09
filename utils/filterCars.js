const filterCars = (
  filter_manufacturer,
  filter_model,
  filter_min_year,
  filter_max_year,
  filter_min_price,
  filter_max_price
) => {
  const filter = {};

  if (filter_manufacturer && filter_model) {
    filter.carModel = `${filter_manufacturer} ${filter_model}`;
  } else if (filter_manufacturer) {
    filter.carModel = new RegExp(filter_manufacturer, "i");
  }

  if (filter_min_year && filter_max_year) {
    filter.carYear = {
      $gte: `${filter_min_year} y`,
      $lte: `${filter_max_year} y`,
    };
  } else if (filter_min_year) {
    filter.carYear = { $gte: `${filter_min_year} y` };
  } else if (filter_max_year) {
    filter.carYear = { $lte: `${filter_max_year} y` };
  }

  if (filter_max_price && filter_min_price) {
    filter.$expr = {
      $and: [
        { $gte: [{ $toDouble: "$carPrice" }, Number(filter_min_price)] },
        { $lte: [{ $toDouble: "$carPrice" }, Number(filter_max_price)] },
      ],
    };
  } else if (filter_min_price) {
    filter.$expr = {
      $gte: [{ $toDouble: "$carPrice" }, Number(filter_min_price)],
    };
  } else if (filter_max_price) {
    filter.$expr = {
      $lte: [{ $toDouble: "$carPrice" }, Number(filter_max_price)],
    };
  }

  return filter;
};

export default filterCars;
