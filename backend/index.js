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




// Kubernetes liveness and readiness probes hit this to check if pod is alive
app.get('/health', (req, res) => {
  console.log('[health] probe hit');   // Promtail picks this up → visible in Grafana Loki
  res.status(200).json({ status: 'ok' });
});

// routes
app.use('/', staticRoutes);
app.use('/user', restrictNotTo(["USER", "ADMIN"]), userRoutes);
app.use('/admin', restrictNotTo(["ADMIN"]), adminRoutes);



app.listen(process.env.PORT, () => {
    console.log(`Server is Running on ${process.env.PORT}`);
});