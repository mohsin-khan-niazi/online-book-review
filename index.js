import express from 'express';
import morgan from 'morgan';
import 'dotenv/config';
import { authenticated as customer_routes } from './router/customer.js';
import { general as genl_routes } from './router/general.js';
import { authenticateUser } from './middleware/auth-user.js';

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/test', authenticateUser, (req, res) => {
  return res.status(200).json({ message: 'Authenticated successfully!' });
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running @ port ${port}`));
