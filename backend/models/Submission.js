const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "problem",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  verdict: {
    type: String,
    enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Compilation Error", "Runtime Error"],
    //  enum: ["Accepted", "Wrong Answer", "Compilation Error"],
    required: true,
  },
    errorMessage: {
    type: String,
    required: false,   // only present on compiler/runtime errors
  },

  // Not used still will work...
  input: {
    type: String,
    required: false, 
  },
  output: {
    type: String,
    required: false,
  },
  expectedOutput: {
    type: String,
    required: false,
  },
  executionTime: {
    type: String, // We can convert this to number
  },
  failedTestCases: [
    {
      input: {
        type: String,
        required: true,
      },
      output: {
        type: String,
        required: true,
      },
      expectedOutput: {
        type: String,
        required: true,
      },
    },
  ],
  memoryUsed: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("submission", submissionSchema);
