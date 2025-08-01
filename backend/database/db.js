const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");

const DBConnection = async () => {
     
    // console.log(MONGO_URL) // gives undefined
    // mongoose.set('bufferCommands', false);  

    try {
        // await mongoose.connect(MONGO_URL, {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        // });
        
        // console.log(process.env.MONGO_URL)
        await mongoose.connect(process.env.MONGO_URL);
         

        console.log("Connected to MongoDB");
    } catch(err) {
        console.log("Error while Connecting of DB !", err);
    }
}

module.exports = {
    DBConnection,
}