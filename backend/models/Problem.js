const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    statement: { 
        type: String, 
        required: true 
    }, 
    difficulty: { 
        type: String, 
        enum: ['Easy', 'Medium', 'Hard'], 
        required: true 
    },
    constraints: { 
        type: String, 
        required: true,
        inputFormat: {
            type: String,
            required: true,
        },
        outputFormat: {
            type: String,
            required: true,
        },
    },
    tags: [{          // e.g., ['Array', 'Binary tree']
        type: String,
        trim : true,
    }], 
    editorial: { 
        type: String
    },
    addedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: "user"
    },
    images: [String], // for images if present in problem like eg. in "Graph Problems"
 }, 
 {
    timestamps: true
 }
);


module.exports = mongoose.model("problem", problemSchema);
