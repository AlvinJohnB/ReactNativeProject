import Model from '../Models/Model.js';

const addMultipleProducts = async (req, res, next) => {
    const products = req.body

    //  Assuming products is an array of product objects in the request body
    const productPromises = products.map((product) => {
        const { name, sku, stock, price, category, retail_price, imageUrl } = product;

        return Model.ProductModel.findOne({ name: name, sku: sku })
            .then((existingProduct) => {
                if (existingProduct) {
                    throw new Error(`Product with name "${name}" and SKU "${sku}" already exists.`);
                }

                return Model.CategoryModel.findOne({ name: category });
            })
            .then((categoryDocument) => {
                if (!categoryDocument) {
                    throw new Error(`Category "${category}" not found.`);
                }

                const newProduct = new Model.ProductModel({
                    name,
                    sku,
                    stock,
                    price,
                    imageUrl,
                    category: categoryDocument,
                    retail_price
                });

                return newProduct.save();
            });
    });

    Promise.all(productPromises)
        .then((savedProducts) => {
            res.status(201).json({ message: 'Products added successfully.', products: savedProducts });
        })
.catch((error) => {
    next(error);
});
};

export default addMultipleProducts;