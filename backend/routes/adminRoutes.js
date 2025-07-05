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


module.exports = router;