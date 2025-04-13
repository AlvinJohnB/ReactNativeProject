import express from 'express';
import Model from '../Models/Model.js'; // Assuming you have an OrderModel and ProductModel in your Models
import mongoose from 'mongoose';

const OrderRouter = express.Router();

// Add order to queue
OrderRouter.post('/add-to-queue', async (req, res, next) => {
  const { items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in the order.' });
  }

  try {
    // Validate product IDs and check stock
    const productIds = items.map((item) => item.productId);
    const products = await Model.ProductModel.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res.status(400).json({ message: 'Some products are invalid or not found.' });
    }

    // Check stock availability
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // // Deduct stock for each product
    // for (const item of items) {
    //   const product = products.find((p) => p._id.toString() === item.productId);
    //   product.stock -= item.quantity;
    //   await product.save();
    // }

    // Generate a unique order ID starting from 0001
    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const prefix = `${currentYear}${currentMonth}`;

    const lastOrder = await Model.OrderModel.findOne({ orderID: { $regex: `^${prefix}` } }).sort({ createdAt: -1 });
    let orderID = `${prefix}0001`;
    if (lastOrder && lastOrder.orderID) {
      const lastOrderNumber = parseInt(lastOrder.orderID.slice(6), 10);
      orderID = `${prefix}${(lastOrderNumber + 1).toString().padStart(4, '0')}`;
    }

    // Create a new order
    const newOrder = new Model.OrderModel({
      orderID: orderID,
      products: items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
      total,
      status: 'pending', // Set the initial status of the order
      createdAt: new Date(),
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({ message: 'Order added to queue successfully.', order: savedOrder });
  } catch (error) {
    console.error('Error adding order to queue:', error);
    next(error);
  }
});

// Fetch orders in the queue
OrderRouter.get('/queue', async (req, res, next) => {
  try {
    const orders = await Model.OrderModel.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .populate({
        path: 'products.product',
        select: 'name sku price retail_price', // Select only the specified fields
      });

    res.status(200).json({ message: 'Orders in queue fetched successfully.', orders });
  } catch (error) {
    console.error('Error fetching orders in queue:', error);
    next(error);
  }
});

// Fetch order by ID
OrderRouter.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid order ID.' });
  }

  try {
    const order = await Model.OrderModel.findById(id).populate({
      path: 'products.product',
      select: 'name sku price retail_price', // Select only the specified fields
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({ message: 'Order fetched successfully.', order });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    next(error);
  }
});

// Add order with completed status
OrderRouter.post('/add-completed-order', async (req, res, next) => {
  const { items, total, change, cash_tendered, mode_of_payment } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in the order.' });
  }

  try {
    // Validate product IDs
    const productIds = items.map((item) => item.productId);
    const products = await Model.ProductModel.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res.status(400).json({ message: 'Some products are invalid or not found.' });
    }

    // Generate a unique order ID starting from 0001
    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const prefix = `${currentYear}${currentMonth}`;

    const lastOrder = await Model.OrderModel.findOne({ orderID: { $regex: `^${prefix}` } }).sort({ createdAt: -1 });
    let orderID = `${prefix}0001`;
    if (lastOrder && lastOrder.orderID) {
      const lastOrderNumber = parseInt(lastOrder.orderID.slice(6), 10);
      orderID = `${prefix}${(lastOrderNumber + 1).toString().padStart(4, '0')}`;
    }

    // Update stock for each product
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Create a new order with completed status
    const newOrder = new Model.OrderModel({
      orderID: orderID,
      products: items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
      total,
      change,
      cash_tendered,
      mode_of_payment,
      status: 'completed', // Set the status to completed
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({ message: 'Completed order added successfully.', order: savedOrder });
  } catch (error) {
    console.error('Error adding completed order:', error);
    next(error);
  }
});

// Update order with completed status
OrderRouter.put('/update-to-completed/:id', async (req, res, next) => {
  const { id } = req.params;
  const { change, cash_tendered, mode_of_payment, items } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid order ID.' });
  }

  try {
    const order = await Model.OrderModel.findById(id);

    if (!order) {
      // If order not found, use add-completed-order logic
      const { items, total, change, cash_tendered, mode_of_payment } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in the order.' });
      }

      // Validate product IDs
      const productIds = items.map((item) => item.productId);
      const products = await Model.ProductModel.find({ _id: { $in: productIds } });

      if (products.length !== items.length) {
        return res.status(400).json({ message: 'Some products are invalid or not found.' });
      }

      // Generate a unique order ID starting from 0001
      const currentYear = new Date().getFullYear();
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const prefix = `${currentYear}${currentMonth}`;

      const lastOrder = await Model.OrderModel.findOne({ orderID: { $regex: `^${prefix}` } }).sort({ createdAt: -1 });
      let orderID = `${prefix}0001`;
      if (lastOrder && lastOrder.orderID) {
        const lastOrderNumber = parseInt(lastOrder.orderID.slice(6), 10);
        orderID = `${prefix}${(lastOrderNumber + 1).toString().padStart(4, '0')}`;
      }

      // Update stock for each product
      for (const item of items) {
        const product = products.find((p) => p._id.toString() === item.productId);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }

      // Create a new order with completed status
      const newOrder = new Model.OrderModel({
        orderID: orderID,
        products: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
        total,
        change,
        cash_tendered,
        mode_of_payment,
        status: 'completed', // Set the status to completed
      });

      const savedOrder = await newOrder.save();

      return res.status(201).json({ message: 'Completed order added successfully.', order: savedOrder });
    }

    if (order.status === 'completed') {
      return res.status(400).json({ message: 'Order is already completed.' });
    }

    if (items && items.length > 0) {
      // Validate product IDs
      const productIds = items.map((item) => item.productId);
      const products = await Model.ProductModel.find({ _id: { $in: productIds } });

      if (products.length !== items.length) {
        return res.status(400).json({ message: 'Some products are invalid or not found.' });
      }

      // Check stock availability and update stock
      for (const item of items) {
        const product = products.find((p) => p._id.toString() === item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          });
        }
      }

      // // Restore stock for previous items
      // for (const prevItem of order.products) {
      //   const product = await Model.ProductModel.findById(prevItem.product);
      //   if (product) {
      //     product.stock += prevItem.quantity;
      //     await product.save();
      //   }
      // }

      // Deduct stock for new items
      for (const item of items) {
        const product = products.find((p) => p._id.toString() === item.productId);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }

      // Update order items
      order.products = items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      }));
    }

    // Update the order status and payment details
    order.status = 'completed';
    order.change = change;
    order.cash_tendered = cash_tendered;
    order.mode_of_payment = mode_of_payment;

    const updatedOrder = await order.save();

    res.status(200).json({ message: 'Order updated to completed successfully.', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order to completed:', error);
    next(error);
  }
});



export default OrderRouter;