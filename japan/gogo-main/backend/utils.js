//登入token用
// utils.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET || '123456',
    {
      expiresIn: '30d',
    }
  );
};

module.exports = {
  generateToken,
};

// const jwt = require('jsonwebtoken');

// // Generate token and set expiration time to 30 days
// const generateToken = (user) => {
//   return jwt.sign(
//     {
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       isAdmin: user.isAdmin,
//     },
//     process.env.JWT_KEY,
//     {
//       expiresIn: '30d',
//     }
//   );
// };

// module.exports = generateToken;
