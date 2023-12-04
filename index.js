import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticated as customer_routes } from './router/customer.js';
import { general as genl_routes } from './router/general.js';
import 'dotenv/config';

const app = express();
app.use(express.json());

// Customer authenication mechanism
app.use('/customer/auth/*', function auth(req, res, next) {
  if (!req.session.authorization) {
    return res.status(403).json({ message: 'User not logged in' });
  }
  const token = req.session.authorization['accessToken'];
  jwt.verify(token, 'access', (err, user) => {
    if (!err) {
      req.user = user;
      next();
    } else return res.status(403).json({ message: 'User not authenticated' });
  });
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running @ port ${port}`));
