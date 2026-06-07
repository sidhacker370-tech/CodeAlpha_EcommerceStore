const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { keyword, category, sort } = req.query;
    
    let query = {};

    // Apply keyword search
    if (keyword) {
      query.name = {
        $regex: keyword,
        $options: 'i', // Case insensitive
      };
    }

    // Apply category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Initialize database query
    let apiQuery = Product.find(query);

    // Apply sorting
    if (sort) {
      if (sort === 'price_asc') {
        apiQuery = apiQuery.sort({ price: 1 });
      } else if (sort === 'price_desc') {
        apiQuery = apiQuery.sort({ price: -1 });
      } else if (sort === 'newest') {
        apiQuery = apiQuery.sort({ createdAt: -1 });
      }
    } else {
      // Default: sort by newest
      apiQuery = apiQuery.sort({ createdAt: -1 });
    }

    const products = await apiQuery;

    // Get unique categories for front-end filters
    const categories = await Product.distinct('category');

    res.json({
      success: true,
      count: products.length,
      categories: ['All', ...categories],
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json({
        success: true,
        data: product,
      });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
};
