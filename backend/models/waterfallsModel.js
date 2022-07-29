const mongoose = require('mongoose');
const slugify = require('slugify');

const waterfallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour name must have less or equal then 40 characters'],
    minlength: [4, 'A tour name must have more or equal then 10 characters']
  },
  slug: String,

  description: {
    type: String,
    required: [true, 'A tour must have a description']
  },
  state: {
    type: String,
    required: [true, 'Please enter the state of the waterfall']
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      required: [true, 'Please specify the coordinates of the waterfall']
    }
  },
  waterSource: { type: String },
  waterfallProfile: { type: String },
  accessibility: { type: String },
  imgDetails: {
    imgFilename: { type: [String] },
    imgUrl: { type: [String] },
    imgDesc: { type: [String] },
    imgFullResFilename: { type: [String] }
  },

  url: { type: String },
  locality: { type: String },
  summary: { type: String },
  lastUpdate: { type: String },
  difficulty: { type: String }
});

waterfallSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

waterfallSchema.pre(/^find/, function(next) {
  this.start = Date.now();
  next();
});

waterfallSchema.post(/^find/, function(docs, next) {
  // eslint-disable-next-line no-console
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

const Waterfall = mongoose.model('Waterfall', waterfallSchema);
module.exports = Waterfall;
