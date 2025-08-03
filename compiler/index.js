const dotenv = require('dotenv');
dotenv.config();

const express = require("express");
const app = express();
// const port = 8000;
const port = process.env.PORT || 8000;
const { generateFile } = require("./generateFile");
const { generateInputFile } = require("./generateInputFile");
const { executeFile } = require("./executeFile");
const cors = require('cors');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

const IS_DOCKER = process.env.IS_DOCKER === "true";
const DB_PATH = IS_DOCKER  ? './backend/database/db' : '../backend/database/db';
const MODELS_PATH =  IS_DOCKER ? './backend/models' : '../backend/models';
const { DBConnection } = require(DB_PATH);

// const { DBConnection } = require('./backend/database/db')
// const MODELS_PATH = './backend/models';
const Problem = require(`${MODELS_PATH}/Problem`)
const Testcase = require(`${MODELS_PATH}/Testcase`);
const Submission = require(`${MODELS_PATH}/Submission`);
const ProblemSolved = require(`${MODELS_PATH}/ProblemSolved`);


// NOW WE ARE RUNNING IN "DOCKER"

DBConnection();

console.log(process.env.IS_DOCKER);

app.use(cors({
  origin : process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());



// Orignal Routes (Run & Submit --> For this older version routes we do not require the above functions) : 

app.post('/run', async (req, res) => {
    // Destructure way to write the code
    // Here language == extension [ Directly extension is send from frontend ]  
    const { language='cpp', code, inputs} = req.body;
    let sampleTestcaseOutput = [];

    if(!(code && language)) {
        return res.status(400).json({
            success: false,
            message: "Code and language are required",
        })
    }

    try {

      // loop over input if multiple inputs are given
      for(let input of inputs) {
        const filePath = generateFile(language, code);

        console.log("Input : ", input);

        const inputFilePath = generateInputFile(input.input);

        console.log("Input File Path : ", inputFilePath)

        if(!(filePath && inputFilePath)) return res.status(404).json({
            success: false,
            message: "File not found",
        })


        // here is error....
        const output = await executeFile(filePath, inputFilePath, language);
        
        const rawOutput = output.replace(/\r\n/g, '\n').trim();
        console.log("Raw Output : ", rawOutput);

        const expectedOutput = input.expectedOutput ? input.expectedOutput.replace(/\r\n/g, '\n').trim() : undefined;
        // OR 
        // const expectedOutput = input.expectedOutput?.replace(/\r\n/g, '\n').trim();
        console.log("ExpectedOutput : ", expectedOutput);

        if(expectedOutput === undefined) {
            sampleTestcaseOutput.push({
                verdict: "Custom testcase Output : ",
                input: input.input,
                output: rawOutput,
                expectedOutput: "N/A",
            });
            continue; // Skip to the next input if no expected output is provided
        }

        if(rawOutput !== expectedOutput) {
            sampleTestcaseOutput.push({
                verdict: "Wrong Answer",
                input: input.input,
                output: rawOutput,
                expectedOutput: expectedOutput,
            });
        }
        //here
        else {
            sampleTestcaseOutput.push({
                verdict: "Correct Answer",
                input: input.input,
                output: rawOutput,
                expectedOutput: expectedOutput,
            });
        }
      }

      console.log("Sample Testcase Output : ", sampleTestcaseOutput);
        return res.status(200).json({
            success: true,
            sampleTestcaseOutput : sampleTestcaseOutput, 
        })
    }
    catch (error) {
        console.log("Execution Error : ", error.stderr || error.error || error);


        return res.status(500).json({
            success: false,
            message: error.stderr || error.error || error,
        })
    }
})

// Submit Route
// Original ROute
// app.post('/submit', async (req, res) => {
//     const { code, language, problemId} = req.body;

//     const token = req.cookies.token;
//     if (!token) {
//       return res.status(401).json({ message: "User is Not loggeIn" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 
//     const userId = decoded._id; 


//     if (!code || !language || !problemId || !userId) {
//       return res.status(400).json({
//         success: false,
//         message: "Code, language, userId, and problemId are required.",
//       });
//     }
  
//     try {
//       const testcases = await Testcase.find({ problemId });
  
//       for (const testCase of testcases) {
//         const filePath = generateFile(language, code);
//         const inputFilePath = generateInputFile(testCase.input);
  
//         const rawOutput = await executeFile(filePath, inputFilePath, language);
//         const output = rawOutput.replace(/\r\n/g, '\n').trim();
//         const expected = testCase.expectedOutput.replace(/\r\n/g, '\n').trim();
  
//         if (output !== expected) {
//           const submission = await Submission.create({
//             problemId,
//             userId,
//             language,
//             code,
//             verdict: "Wrong Answer",
//             input: testCase.input,
//             output,
//             expectedOutput: expected,
//             failedTestCases: [{
//               input: testCase.input,
//               output,
//               expectedOutput: expected,
//             }]
//           });
  
//           return res.status(200).json({
//             verdict: "Wrong Answer",
//             failedTestCase: {
//               input: testCase.input,
//               output,
//               expected: expected,
//             },
//             timestamp: submission.createdAt, // Send back timestamp
//             language,
//           });
//         }
//       }
  
//       const acceptedSubmission = await Submission.create({
//         problemId,
//         userId,
//         language,
//         code,
//         verdict: "Accepted",
//       });
      
//       const alreadySolved = await ProblemSolved.findOne({ userId, problemId });

//       if (!alreadySolved) {
//         await ProblemSolved.create({ userId, problemId });
//       }

//       return res.status(200).json({
//         verdict: "Accepted",
//         timestamp: acceptedSubmission.createdAt,
//         language,
//         // code,
//       });
  
//     } 
//     catch (error) {
//       console.error("Submit error:", error);

//       // const submission = await Submission.create({
//       //       problemId,
//       //       userId,
//       //       language,
//       //       code,
//       //       verdict: "Compilation error or execution error",
//       //       input: testCase.input,
//       //       output,
//       //       expectedOutput: expected,
//       //       failedTestCases: [{
//       //         input: testCase.input,
//       //         output,
//       //         expectedOutput: expected,
//       //       }]
//       // });

//       return res.status(500).json({
//         success: false,
//         message: error?.message || "Compilation or runtime error",
//       });
//     }
// });

app.post('/submit', async (req, res) => {
  const { code, language, problemId } = req.body;

  // const token = req.cookies.token;
  // if (!token) {
  //   return res.status(401).json({ message: "User is Not logged in" });
  // }

  // Switching to Bearer tokens
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const userId = decoded._id;

  if (!code || !language || !problemId || !userId) {
    return res.status(400).json({
      success: false,
      message: "Code, language, userId, and problemId are required.",
    });
  }

  try {
    const testcases = await Testcase.find({ problemId });

    for (const testCase of testcases) {
      const filePath = generateFile(language, code);
      const inputFilePath = generateInputFile(testCase.input);

      try {
        const rawOutput = await executeFile(filePath, inputFilePath, language);
        const output = rawOutput.replace(/\r\n/g, '\n').trim();
        const expected = testCase.expectedOutput.replace(/\r\n/g, '\n').trim();

        if (output !== expected) {
          // Wrong Answer
          const submission = await Submission.create({
            problemId, userId, language, code,
            verdict: "Wrong Answer",
            input: testCase.input,
            output,
            expectedOutput: expected,
            failedTestCases: [{ input: testCase.input, output, expectedOutput: expected }]
          });

          return res.status(200).json({
            verdict: "Wrong Answer",
            failedTestCase: { input: testCase.input, output, expected },
            timestamp: submission.createdAt,
            language,
          });
        }

        // otherwise, continue to next test case
      } catch (execError) {

            const stderrMsg = ( execError.stderr || execError.error || execError || "Unknown error")
            console.log("STDERR:", stderrMsg);

            // Store in DB
            const submission = await Submission.create({
              problemId, userId, language, code,
              verdict: "Compilation or Runtime Error",
              input: testCase.input,
              output: stderrMsg, //  guaranteed string
              expectedOutput: null,
              failedTestCases: [{
                input: testCase.input,
                output: stderrMsg, // guaranteed string
                expectedOutput: testCase.expectedOutput,
              }]
            });

            console.log("Stored in DB")

            // Send to frontend
            return res.status(200).json({
              verdict: "Compilation or Runtime Error",
              error: stderrMsg,
              failedTestCase: {
                input: testCase.input,
                output: stderrMsg,
                expected: testCase.expectedOutput,
              },
              timestamp: submission.createdAt,
              language,
            });
          }

        }

    // All passed → Accepted
    const acceptedSubmission = await Submission.create({
      problemId, userId, language, code, verdict: "Accepted"
    });
    await ProblemSolved.updateOne(
      { userId, problemId }, {},
      { upsert: true }
    );
    return res.status(200).json({
      verdict: "Accepted",
      timestamp: acceptedSubmission.createdAt,
      language,
    });

  } catch (error) {
    console.error("Submit error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
});


app.get('/submissions', async (req, res) => {
  // console.log("Fetching submissions for user:", req.user._id);
  try {
    // const token = req.cookies.token;
    // if (!token) {
    //   return res.status(401).json({ message: "User not logged in" });
    // }

    // Switching to Bearer tokens
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Missing auth token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded._id;

    const { problemId } = req.query;
    
    if (!problemId) {
      return res.status(400).json({ message: "Missing problemId" });
    }

    const submissions = await Submission.find({
      userId,
      problemId,
    }).sort({ createdAt: -1 });


    // if(submissions.length === 0) {
    //   console.log("No submissions found for the problem:", problemId);
    //   return res.status(200).json({ message: "No submissions found for this problem" });
    // }

    return res.status(200).json({ submissions });
  }
  catch (error) {
    return res.status(500).json({ message: "Failed to fetch submissions", error });
    // If user had not made any submission for the problem
    // return res.status(404).json({ message: "Failed to fetch submissions", error });
  }
});
  


app.listen(port, () => {
    console.log(`Compiler server is running on port ${port}`);
});

