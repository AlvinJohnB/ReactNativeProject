import mongoose from 'mongoose';

const costumerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
    },
    credit: {
      type: String,
    },
    credit_limit: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Costumer', costumerSchema);
