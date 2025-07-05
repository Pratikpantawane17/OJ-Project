const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const Testcase = require("../models/Testcase");

//  Create Problem

router.post('/problem-form', async (req, res) => {
    // const { problemNumber, title, statement, difficulty, constraints, inputFormat, outputFormat, tags, editorial, testcases, images, hints } = req.body;
    const { title, statement, difficulty, constraints, inputFormat, outputFormat, tags, editorial, images, hints, testcases, } = req.body;

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
            hints,
            images,
            addedBy: req.user?._id, // optional chaining in case user is undefined
        });

        if (problem && testcases && testcases.length > 0) {
            const testcasesToCreate = testcases.map(tc => ({
                ...tc,
                problemId: problem._id
            }));

            await Testcase.insertMany(testcasesToCreate);
        }

        res.status(201).json(problem);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Failed to create problem",
            error: error.message
        });
    }
});

// To Fetch data to show on Frontend before updating 
router.get('/problem-form/:id', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        res.status(200).json(problem);
    } 
    catch (error) {
        res.status(400).json({
            message: "Failed to fetch problem",
            error: error.message,
        });
    }
});

// Update Request
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
  
      res.status(200).json({ 
        message: "Problem and related testcases deleted successfully" 
    });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to delete problem", 
        error: error.message 
    });
    }
});

module.exports = router;