import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Model from '../Models/Model.js';

const createToken = (user, res, next) => {
  const { id, email, name, username, userType, imageUrl } = user;
  const payload = {
    _id: id,
    email,
    name,
    username,
    userType,
    imageUrl,
  };
  console.log(payload);
  // create a token
  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: '3d',
    },
    (err, token) => {
      // Error Create the Token
      if (err) {
        res.status(500);
        next(new Error('Unable to generate Token.'));
      } else {
        // Token Created
        res.json({
          token,
        });
      }
    }
  );
};

const userSignIn = (req, res, next) => {
  const { username, password } = req.body;
  // Find user with the passed email
  Model.UserModel.findOne({ username }).then((user) => {
    if (user) {
      // if email found compare the password
      bcryptjs.compare(password, user.password).then((result) => {
        // if password match create payload
        if (result) {
          createToken(user, res, next);
        } else {
          res.json({
            status: 'error',
            error: 'Invalid Password',
          });
          // next(new Error('Invalid Password'));
        }
      });
    } else {
      res.json({
        status: 'error',
        error: 'No data found with this username',
      });
    }
  });
};

export default userSignIn;
