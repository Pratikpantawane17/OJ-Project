const mongoose = require("mongoose");

const testcaseSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "problem", 
        required: true
    },
    input: {
        type: String,
        required: [true, "Input is required"]
    },
    expectedOutput: {
        type: String,
        required: [true, "Expected output is required"]
    },
    // You can remove this bcz the sampleTestcase is stored in Problem Schema itself....
    isSample: {
        type: Boolean,
        default: false
    },
    // // Not neccessary to have explanation for each test case....
    // explanation: {
    //     type: String,
    // },
});

module.exports = mongoose.model("testcase", testcaseSchema);