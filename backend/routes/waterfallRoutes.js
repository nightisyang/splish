const express = require('express');
const waterfallController = require('../controllers/waterfallController');

const router = express.Router();

router
  .route('/')
  .get(waterfallController.getAllWaterfalls)
  .post(waterfallController.createWaterfall);

router
  .route('/:id')
  .get(waterfallController.getWaterfall)
  .patch(waterfallController.updateWaterfall)
  .delete(waterfallController.deleteWaterfall);

router.get(
  '/waterfalls-within/:distance/center/:latlng/unit/:unit',
  waterfallController.getWaterfallsWithin
);
// /tours-distance?distance=233,center=-40,45/unit=mi
// /tours-distance/233/center/-40,45/unit/mi

router
  .route('/distances/:latlng/unit/:unit')
  .get(waterfallController.getDistances);

router.route('/:id/:latlng/').get(waterfallController.getWaterfall);

module.exports = router;
