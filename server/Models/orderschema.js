import mongoose from 'mongoose';
// import Product from './productSchema.js';


const orderSchema = new mongoose.Schema(
  {
    orderID: {
      type: String,
      required: true,
    },
    products: [
        {product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
        qty: {type: Number},}
    ],
    price: {
      type: Number,
    },
    mode_of_payment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Order', orderSchema);
