const jwt = require('jsonwebtoken');

exports.signToken = (user) => jwt.sign(
  {
    sub: user.id,
    role: user.role,
    hospital_id: user.hospital_id
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '12h'
  }
);

exports.verifyToken = (token) => jwt.verify(
  token,
  process.env.JWT_SECRET
);