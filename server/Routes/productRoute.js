import express from 'express';
import addCategory from '../controller/addCategory.js'
import fetchCategories from '../controller/fetchCategory.js';
import fetchProducts from '../controller/fetchProducts.js';
import multer from 'multer';
import path from 'path';
import Model from '../Models/Model.js';


const AuthRouter = express.Router();

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/'); // Specify the directory to save uploaded files
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
        }
    });

    const upload = multer({ storage: storage });


    AuthRouter.post('/add-product', upload.single('image'), (req, res, next) => {
        const { name, sku, stock, price, category, retail_price } = req.body;
        const imageUrl = req.file.filename || null; // Get the filename from the uploaded file
        // const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        try {
            Model.ProductModel.findOne({ name: name, sku: sku })
                .then((existingProduct) => {
                    if (existingProduct) {
                        return res.json({ errormessage: 'Product with the same name and SKU already exists.' });
                    }
                    // Create a new product
                    Model.CategoryModel.findOne({ name: category })
                        .then((categoryDocument) => {
                            if (!categoryDocument) {
                                return res.json({ errormessage: 'Category not found.' });
                            }

                            const newProduct = new Model.ProductModel({
                                name,
                                sku,
                                stock,
                                price,
                                imageUrl,
                                category: categoryDocument, // Assign the found category document
                                retail_price
                            });

                            // Save the product to the database
                            return newProduct.save();
                        })
                        .then((savedProduct) => {
                            res.status(201).json({ message: 'Product added successfully.', product: savedProduct });
                        })
                        .catch((error) => {
                            next(error);
                        });
                })
                .catch((error) => {
                    next(error);
                });
        } catch (error) {
            next(error);
        }
    });

    AuthRouter.get('/fetch-product/:id', (req, res, next) => {
        const { id } = req.params;
        Model.ProductModel.findById(id)
            .populate('category')
            .then((product) => {
                if (!product) {
                    return res.status(404).json({ message: 'Product not found.' });
                }
                res.status(200).json({ product });
            })
            .catch((error) => {
                next(error);
            });
    });

    AuthRouter.get('/fetch-products', fetchProducts);
    AuthRouter.post('/add-category', addCategory);
    AuthRouter.get('/fetch-category', fetchCategories);

    


export default AuthRouter;
