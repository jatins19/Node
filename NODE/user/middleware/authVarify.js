import jwt from 'jsonwebtoken'
// import User from '../models/userModel.js'
import mongoose from 'mongoose';
const User = mongoose.model('User');

const config = process.env;

const verifyToken = async (req, res, next) => { 
  const token = req.body.token || req.query.token || req.headers["x-access-token"];
  try {
    if (token) {
      const decoded = jwt.verify(token, config.TOKEN_KEY); 
      req.user = decoded;
      var dt = await User.exists({ _id: req.user._id });
      if (!dt) {
        return res.status(401).send({ "status": false, 'message': "Authentication failed" });
      }
    }else{
      return res.status(401).send({ "status": false, 'message': "Authentication failed" });
    }
  } catch (err) {
    return res.status(401).send({ "status": false, 'message': "Invalid Token", "err": err.message });
  }
  return next();
};

export default verifyToken;