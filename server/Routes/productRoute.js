import express from 'express';
import addCategory from '../controller/addCategory.js'
import fetchCategories from '../controller/fetchCategory.js';
import fetchProducts from '../controller/fetchProducts.js';
import multer from 'multer';
import path from 'path';
import Model from '../Models/Model.js';
import fs from 'fs';
import addMultipleProducts from '../controller/addMultipleProducts.js';


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

    AuthRouter.put('/edit-product/:id', upload.single('image'), (req, res, next) => {
        const { id } = req.params;
        const { name, sku, stock, price, category, retail_price } = req.body;
        const imageUrl = req.file ? req.file.filename : null;

        Model.ProductModel.findById(id)
            .then((product) => {
                if (!product) {
                    return res.status(404).json({ message: 'Product not found.' });
                }

                // If a new file is uploaded, delete the old file
                if (imageUrl && product.imageUrl) {
                    const oldFilePath = `uploads/${product.imageUrl}`;
                    fs.unlink(oldFilePath, (err) => {
                        if (err) {
                            console.error(`Failed to delete old file: ${oldFilePath}`, err);
                        }
                    });
                }

                // Update product fields
                product.name = name || product.name;
                product.sku = sku || product.sku;
                product.stock = stock || product.stock;
                product.price = price || product.price;
                product.retail_price = retail_price || product.retail_price;
                if (imageUrl) {
                    product.imageUrl = imageUrl;
                }

                if (category) {
                    return Model.CategoryModel.findOne({ name: category })
                        .then((categoryDocument) => {
                            if (!categoryDocument) {
                                return res.status(404).json({ message: 'Category not found.' });
                            }
                            product.category = categoryDocument;
                            return product.save();
                        })
                        .then((updatedProduct) => {
                            res.status(200).json({ message: 'Product updated successfully.', product: updatedProduct });
                        });
                } else {
                    return product.save().then((updatedProduct) => {
                        res.status(200).json({ message: 'Product updated successfully.', product: updatedProduct });
                    });
                }
            })
            .catch((error) => {
                next(error);
            });
    });

    AuthRouter.put('/restock-product/:id', (req, res, next) => {
        const { id } = req.params;
        const { stock } = req.body;

        if (stock === undefined || stock < 0) {
            return res.status(400).json({ message: 'Invalid stock value.' });
        }

        Model.ProductModel.findById(id)
            .then((product) => {
                if (!product) {
                    return res.status(404).json({ message: 'Product not found.' });
                }

                product.stock = stock;

                return product.save();
            })
            .then((updatedProduct) => {
                res.status(200).json({ message: 'Product restocked successfully.', product: updatedProduct });
            })
            .catch((error) => {
                next(error);
            });
    });

    AuthRouter.delete('/delete-product/:id', (req, res, next) => {
        const { id } = req.params;

        Model.ProductModel.findById(id)
            .then((product) => {
                if (!product) {
                    return res.status(404).json({ message: 'Product not found.' });
                }

                // If the product has an associated image, delete the file
                if (product.imageUrl) {
                    const filePath = `uploads/${product.imageUrl}`;
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`Failed to delete file: ${filePath}`, err);
                        }
                    });
                }

                // Delete the product from the database
                return Model.ProductModel.findByIdAndDelete(id);
            })
            .then(() => {
                res.status(200).json({ message: 'Product deleted successfully.' });
            })
            .catch((error) => {
                next(error);
            });
    });
    AuthRouter.post('/add-multiple-products', addMultipleProducts);

    AuthRouter.get('/fetch-products', fetchProducts);
    AuthRouter.post('/add-category', addCategory);
    AuthRouter.get('/fetch-category', fetchCategories);

    


export default AuthRouter;
