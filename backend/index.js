const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();

const { DBConnection } = require("./database/db");

const bcrypt = require('bcryptjs');

const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User");
const { setUser, getUser }= require('./service/auth');
const cookieParser = require('cookie-parser');
const { checkForAuthorization, restrictNotTo } = require('./middlewares/auth');

const staticRoutes = require('./routes/staticRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');


DBConnection();



app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// middleware
app.use(express.json());
app.use(express.urlencoded( {extended : true} ));
app.use(cookieParser());
app.use(checkForAuthorization);



// routes
app.use('/', staticRoutes);
app.use('/user', restrictNotTo(["USER", "ADMIN"]), userRoutes);
app.use('/admin', restrictNotTo(["ADMIN"]), adminRoutes);



app.listen(process.env.PORT, () => {
    console.log(`Server is Running on ${process.env.PORT}`);
});