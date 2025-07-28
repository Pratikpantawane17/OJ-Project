const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const Testcase = require("../models/Testcase");
const Submission = require("../models/Submission");

//  Create Problem
router.post('/problem-form', async (req, res) => {
    const { title, statement, difficulty, constraints, inputFormat, outputFormat, tags, editorial, sampleTestcases, hiddenTestcases, images, hints, } = req.body;

    try {
        const problem = await Problem.create({
            // problemNumber,
            title,
            statement,
            difficulty,
            constraints,    
            inputFormat,
            outputFormat,
            tags,
            editorial,
            sampleTestcases,
            hints,
            images,
            addedBy: req.user?._id, // optional chaining in case user is undefined
        });

        if (problem && hiddenTestcases && hiddenTestcases.length > 0) {
            const testcasesToCreate = sampleTestcases.map(tc => ({
                problemId: problem._id,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isSample: true, 
            }));
            
            hiddenTestcases.map(tc => {
                testcasesToCreate.push({
                    problemId: problem._id,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    isSample: false, 
                })
            })

            await Testcase.insertMany(testcasesToCreate);
        }

        res.status(201).json(problem);
    } 
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Failed to create problem",
            error: error.message
        });
    }
});

// To Fetch data to show on Frontend before updating 
// router.get('/problem-form/:id', async (req, res) => {
//     try {
//         const problem = await Problem.findById(req.params.id);

//         // Add hidden Test cases to problem
//         problem.hiddenTestcases = await Testcase.find({ problemId: req.params.id });

//         console.log(problem.hiddenTestcases, req.params.id);

//         if (!problem) {
//             return res.status(404).json({ message: "Problem not found" });
//         }
//         res.status(200).json(problem);
//     } 
//     catch (error) {
//         res.status(400).json({
//             message: "Failed to fetch problem",
//             error: error.message,
//         });
//     }
// });

// Update Request

router.get('/problem-form/:id', async (req, res) => {
  try {
    const doc = await Problem.findById(req.params.id);

    if (!doc) return res.status(404).json({ message: "Problem not found" });

    // Fetch the hidden testcases
    const hiddenTestcases = await Testcase.find({ problemId: req.params.id, isSample: false });

    // Convert the Mongoose Document to a POJO, then attach
    const problem = doc.toObject();
    problem.hiddenTestcases = hiddenTestcases;

    if(!problem) {
        return res.status(404).json({ message: "Problem not found" });
    }

    return res.status(200).json(problem);
  }
  catch (error) {
    return res.status(400).json({
      message: "Failed to fetch problem",
      error: error.message,
    });
  }
});


router.put('/problem-form/:id', async (req, res) => {
    try {
        const updatedProblem = await Problem.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                addedBy: req.user._id, // keep track of who updated
            },
            { new: true } // return the updated document
        );
        
        await Testcase.deleteMany({ problemId: req.params.id, isSample: false });

        if (req.body.hiddenTestcases && req.body.hiddenTestcases.length > 0) {
            const testcasesToCreate = req.body.hiddenTestcases.map(tc => ({
                problemId: req.params.id,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
            }));
            
        await Testcase.insertMany(testcasesToCreate);
        }

        if (!updatedProblem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({
            message: "Problem updated successfully",
            problem: updatedProblem
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to update problem",
            error: error.message,
        });
    }
});


router.delete("/problem/:id", async (req, res) => {
    try {
      const problemId = req.params.id;
  
      // Delete the problem
      const deletedProblem = await Problem.findByIdAndDelete(problemId);
  
      if (!deletedProblem) {
        return res.status(404).json({ 
            message: "Problem not found" 
        });
      }
        
      // Delete all related testcases
      await Testcase.deleteMany({ problemId: problemId });
      await Submission.deleteMany({ problemId: problemId, userId: req.user._id });

      res.status(200).json({ 
        message: "Problem and related testcases & submissions are deleted successfully" 
    });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to delete problem", 
        error: error.message 
    });
    }
});

module.exports = router;