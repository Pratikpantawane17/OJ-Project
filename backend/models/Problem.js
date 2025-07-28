const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    // problemNumber : {
    //     type: Number,
    //     // required: [true, "Problem Number is required"],
    //     // unique: true,
    // },
    title: { 
        type: String, 
        required: true 
    },
    statement: { 
        type: String, 
        required: true,
    }, 
    difficulty: { 
        type: String, 
        enum: ['Easy', 'Medium', 'Hard'],
        required: true 
    },
    constraints: { 
        type: [String], 
        required: true,
        default : [],
    },
    inputFormat: {
        type: String,
        // required: true,
    },
    outputFormat: {
        type: String,
        // required: true,
    },
    tags: {          // e.g., ['Array', 'Binary tree']
        type: [String],
        trim : true,
        default: [],
    }, 
    editorial: { 
        type: String
    },
    sampleTestcases: [{
        input: {
            type: String,
            required: true,
        },
        expectedOutput: {
            type: String,
            required: true,
        },
        explanation: {
            type: String,
            required: false,
        }
    }],
    
    addedBy: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    images: {         // for images if present in problem like eg. in "Graph Problems"
        type: [String],
        default : [],
    }, 
    hints : {
        type: [String],
        default : [],
    },
    // These are the sample test cases -> this will be sent to backend for evaluation of code -> /run
    // /input-teastcase --> 
    // /submit --> testcases le from DB (which inlcudes sample test cases also given in problem) --> Fetch test cases by using problem_.id --> run the code against that testcase & compare the output of code & DB.....show verdict (on Submission page --> submission should store in DB Submission model --> by using problem_.id & user_id)
    // testcases : {
    //     type: [String],
    //     required: true,
    // }
}, 
 {
    timestamps: true
 }
);


module.exports = mongoose.model("problem", problemSchema);
