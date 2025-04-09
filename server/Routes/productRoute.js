import express from 'express';
import addCategory from '../controller/addCategory.js'
import fetchCategories from '../controller/fetchCategory.js';
// import addCategory from '../controller/product/addCategory';


const AuthRouter = express.Router();

AuthRouter.post('/add-category', addCategory);
AuthRouter.get('/fetch-category', fetchCategories);

// AuthRouter.post('/', userSignIn);
// AuthRouter.post('/signUp', uploa.single('imageUrl'), userSignUp);

export default AuthRouter;
