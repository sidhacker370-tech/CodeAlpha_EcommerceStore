const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      required: [true, 'Please add an image path or URL'],
      default: '/images/placeholder.jpg',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
