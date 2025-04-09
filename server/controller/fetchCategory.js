import Model from '../Models/Model.js';



const fetchCategories = async (req, res, next) => {
    try {
        const categories = await Model.CategoryModel.find();
        res.json({
            message: 'Categories fetched successfully.',
            categories,
        });
    } catch (err) {
        // res.status(500);
        console.log(err);
        // next(new Error(`Unable to fetch categories. Please try later. ${err}`));
    }
};

export default fetchCategories;