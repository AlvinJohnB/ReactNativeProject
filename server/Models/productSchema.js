import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      unique: true,
    },
    stock: {
      type: Number,
    },
    price: {
      type: Number,
      required: true,
    },
    retail_price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    imageUrl: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Product', productSchema);
