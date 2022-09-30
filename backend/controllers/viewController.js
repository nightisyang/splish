const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getSupport = catchAsync(async (req, res, next) => {

    res.status(200).render('support', {
        title: 'Support Page',
        // body: "Hello world"
    })
})