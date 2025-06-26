const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const DBConnection = async () => {
    const MONGO_URL = process.env.MONGO_URL;
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");
    } catch(err) {
        console.log("Error while Connecting of DB !", err);
    }
}

module.exports = {
    DBConnection,
}