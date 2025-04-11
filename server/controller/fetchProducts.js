import Model from '../Models/Model.js';

const fetchProducts = async (req, res, next) => {
  Model.ProductModel.find()
    .populate('category')
    .then((products) => {
      res.status(200).json({
        status: 'success',
        data: products,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    });
};

export default fetchProducts;