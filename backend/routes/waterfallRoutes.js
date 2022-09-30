const express = require('express');
const waterfallController = require('../controllers/waterfallController');

const router = express.Router();

<<<<<<< HEAD
router
  .route('/')
  .get(waterfallController.getAllWaterfalls)
  // .post(waterfallController.createWaterfall);

router
  .route('/:id')
  .get(waterfallController.getWaterfall)
  // .patch(waterfallController.updateWaterfall)
  // .delete(waterfallController.deleteWaterfall);
=======
router.route('/').get(waterfallController.getAllWaterfalls);
// .post(waterfallController.createWaterfall);

router.route('/:id').get(waterfallController.getWaterfall);
// .patch(waterfallController.updateWaterfall)
// .delete(waterfallController.deleteWaterfall);
>>>>>>> 77a9aaff4cffed861d85635604cdd8fb07e4f47c

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
