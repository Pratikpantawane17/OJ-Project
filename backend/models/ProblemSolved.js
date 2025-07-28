const mongoose = require('mongoose');
const Problem = require('./Problem');

const problemSolvedSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "problem",
    },
},
{
    timestamps: true,
});

module.exports = mongoose.model('problemsolved', problemSolvedSchema);