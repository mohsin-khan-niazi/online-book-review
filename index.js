const express = require('express');
const jwt = require('jsonwebtoken');
const customer_routes = require('./router/customer.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());


// Customer authenication mechanism
app.use("/customer/auth/*", function auth(req,res,next){
  if (!req.session.authorization){
    return res.status(403).json({message: "User not logged in"})
  }
  const token = req.session.authorization["accessToken"];
  jwt.verify(token, 'access', (err, user) => {
    if (!err) {
      req.user = user;
      next();
    }
    else return res.status(403).json({message: "User not authenticated"})
  })
});
 
const PORT=5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
