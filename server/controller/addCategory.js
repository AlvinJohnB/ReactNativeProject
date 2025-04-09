import Model from '../Models/Model.js';

const addCategory = async (req, res, next) => {
    const { name, color } = req.body;

    try {
        // Check if a category with the same name already exists
        const existingCategory = await Model.CategoryModel.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                message: 'Category name already exists. Please choose a different name.',
            });
        }

        // Create a new category
        const newCategory = new Model.CategoryModel({
            name,
            color,
        });

        const savedCategory = await newCategory.save();
        res.status(200).json({
            message: 'Category created successfully.',
            savedCategory,
        });
    } catch (err) {
        res.status(500);
        next(new Error(`Unable to create category. Please try later. ${err}`));
    }
};

export default addCategory;