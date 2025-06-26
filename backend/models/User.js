const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullname : {
        type : String,
        default : null,
        required : true, 
    },
    email : {
        type: String,
        default: null,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        default: null,
        required: true,
    },
    password : {
        type: String,
        required: true,
    },

    role : {
        type: String,
        default: "USER",
        required: true, 
    }

});

module.exports = mongoose.model("user", userSchema);