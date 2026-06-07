const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation } = require('../utils/sendEmail');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { products, shippingAddress, paymentMethod, paymentStatus } = req.body;

    if (!products || products.length === 0) {
      res.status(400);
      throw new Error('No items in order');
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      res.status(400);
      throw new Error('Please fill in complete shipping address');
    }

    // Verify and build order products list with accurate DB prices
    let orderProducts = [];
    let computedTotalAmount = 0;

    for (const item of products) {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        res.status(404);
        throw new Error(`Product not found: ${item.productId}`);
      }

      const orderItemPrice = dbProduct.price;
      const orderItemTotal = orderItemPrice * item.quantity;
      computedTotalAmount += orderItemTotal;

      orderProducts.push({
        productId: dbProduct._id,
        name: dbProduct.name,
        quantity: item.quantity,
        price: orderItemPrice,
      });
    }

    // Create the order
    const order = await Order.create({
      userId: req.user._id,
      products: orderProducts,
      totalAmount: computedTotalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentStatus || 'Pending',
      status: paymentStatus === 'Paid' ? 'Processing' : 'Pending',
    });

    // If order is paid online, automatically transition status from Processing to Confirmed after 35 seconds
    if (paymentStatus === 'Paid') {
      setTimeout(async () => {
        try {
          const updatedOrder = await Order.findByIdAndUpdate(order._id, { status: 'Confirmed' }, { new: true });
          console.log(`[ORDER TIMEOUT]: Order ${order._id} transitioned from Processing to Confirmed.`);
          
          // Send email confirmation containing the updated Confirmed status
          sendOrderConfirmation(req.user.email, req.user.name, updatedOrder).catch((err) => {
            console.error('Async order confirmation email dispatch error:', err.message);
          });
        } catch (err) {
          console.error(`Failed to automatically transition order ${order._id} status:`, err.message);
        }
      }, 35000);
    } else {
      // For COD, send email confirmation immediately
      sendOrderConfirmation(req.user.email, req.user.name, order).catch((err) => {
        console.error('Async order confirmation email dispatch error:', err.message);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check if the order belongs to the requesting user
    if (order.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
};
