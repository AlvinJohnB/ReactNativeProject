import mongoose from 'mongoose';
// import Product from './productSchema.js';


const orderSchema = new mongoose.Schema(
  {
    orderID: {
      type: String,
      required: true,
    },
    products:[
      {
        product:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity:{
          type: Number,
          required: true,
        },
      }
    ],
    price: {
      type: Number,
    },
    mode_of_payment: {
      type: String,
    },
    queue_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'canceled'],
      default: 'pending',
    }, 
    closed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Order', orderSchema);
