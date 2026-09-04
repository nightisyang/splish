const { WaterfallModel, getCatalogMetadata } = require('../db/sqlite');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

function geoDistance(lat1, lon1, lat2, lon2) {
  // source https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula/27943#27943
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

exports.getAllWaterfalls = catchAsync(async (req, res, next) => {
  // Parse query parameters
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Build options
  const options = {};

  // Handle sorting
  if (req.query.sort) {
    options.sort = req.query.sort;
  }

  // Handle pagination
  const page = req.query.page * 1 || 1;
  const limit = Math.min(req.query.limit * 1 || 200, 500);
  options.limit = limit;
  options.skip = (page - 1) * limit;

  // Get waterfalls using SQLite
  const start = Date.now();
  const waterfalls = WaterfallModel.find(queryObj, options);
  const total = WaterfallModel.count(queryObj);
  console.log(`Query took ${Date.now() - start} milliseconds!`);

  // The catalog version changes when a newly promoted source snapshot becomes active.
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  res.set('X-Splish-Catalog-Version', getCatalogMetadata().catalog_version || 'unknown');

  // send response
  res.status(200).json({
    status: 'success',
    results: waterfalls.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      waterfalls
    }
  });
});

exports.getCatalogManifest = catchAsync(async (req, res) => {
  const metadata = getCatalogMetadata();
  const total = WaterfallModel.count();
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.status(200).json({
    status: 'success',
    data: {
      catalog: {
        version: metadata.catalog_version || null,
        refreshedAt: metadata.source_snapshot_at || null,
        source: metadata.source_url || 'https://waterfallsofmalaysia.com',
        activeRecords: total,
        endpoints: {
          waterfalls: '/api/v1/waterfalls?limit=500&sort=name',
          detail: '/api/v1/waterfalls/{id}'
        }
      }
    }
  });
});

exports.getWaterfall = catchAsync(async (req, res, next) => {
  let distance;
  const { id, latlng } = req.params;

  const start = Date.now();
  const waterfall = WaterfallModel.findById(id);
  console.log(`Query took ${Date.now() - start} milliseconds!`);

  if (!waterfall) {
    return next(new AppError('No document found with that ID', 404));
  }

  if (latlng) {
    const [userLat, userLng] = latlng.split(',');
    const [waterfallLng, waterfallLat] = waterfall.location.coordinates;

    distance = geoDistance(userLat, userLng, waterfallLat, waterfallLng);
    distance = Math.round(distance * 10) / 10;
  }

  res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.set('X-Splish-Catalog-Version', getCatalogMetadata().catalog_version || 'unknown');

  res.status(200).json({
    status: 'success',
    data: {
      waterfall,
      distance
    }
  });
});

exports.createWaterfall = catchAsync(async (req, res, next) => {
  const newWaterfall = WaterfallModel.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      data: newWaterfall
    }
  });
});

exports.updateWaterfall = catchAsync(async (req, res, next) => {
  const waterfall = WaterfallModel.findByIdAndUpdate(req.params.id, req.body);

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
  const result = WaterfallModel.delete(req.params.id);

  if (!result) {
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

  if (!lat || !lng) {
    return next(new AppError('Please provide a location.', 400));
  }

  // Convert distance to kilometers
  const radiusKm = unit === 'mi' ? distance * 1.60934 : distance * 1;

  const start = Date.now();
  const waterfalls = WaterfallModel.findWithinRadius(
    parseFloat(lat),
    parseFloat(lng),
    radiusKm
  );
  console.log(`Query took ${Date.now() - start} milliseconds!`);

  res.status(200).json({
    status: 'success',
    results: waterfalls.length,
    data: {
      data: waterfalls
    }
  });
});

// distances/:latlng/unit/:unit
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(new AppError('Please provide a location.', 400));
  }

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const start = Date.now();
  const distances = WaterfallModel.aggregate([
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
  console.log(`Query took ${Date.now() - start} milliseconds!`);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
