import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    color:{
        type: String,
        default: '#008000'
    }
  },
  {
    timestamps: false,
  }
);

export default mongoose.model('Category', categorySchema);
