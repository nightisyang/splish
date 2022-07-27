const Waterfall = require('../models/waterfallsModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllWaterfalls = catchAsync(async (req, res, next) => {
  // get all waterfalls
  const features = new APIFeatures(Waterfall.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const waterfalls = await features.query;

  // send response
  res.status(200).json({
    status: 'success',
    results: waterfalls.length,
    data: {
      data: waterfalls
    }
  });
});

exports.getWaterfall = catchAsync(async (req, res, next) => {
  const waterfall = await Waterfall.findById(req.params.id);

  if (!waterfall) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: waterfall
    }
  });
});

exports.createWaterfall = catchAsync(async (req, res, next) => {
  const newWaterfall = await Waterfall.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      data: newWaterfall
    }
  });
});

exports.updateWaterfall = catchAsync(async (req, res, next) => {
  const waterfall = await Waterfall.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!waterfall) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: waterfall
    }
  });
});

exports.deleteWaterfall = catchAsync(async (req, res, next) => {
  const waterfall = await Waterfall.delete(req.params.id);

  if (!waterfall) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: {
      data: null
    }
  });
});

exports.getWaterfallsWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  // mongo takes in consideration of the radius of the earth, unit is in radiance
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('Please provide a location.', 400));
  }

  const tours = await Waterfall.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  // console.log(distance, lat, lng, unit);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

// distances/:latlng/unit/:unit
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  // mongo takes in consideration of the radius of the earth, unit is in radiance
  // const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('Please provide a location.', 400));
  }

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const distances = await Waterfall.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
