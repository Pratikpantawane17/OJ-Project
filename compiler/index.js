const express = require("express");
const app = express();
const port = 8000;
const { generateFile } = require("./generateFile");
const { generateInputFile } = require("./generateInputFile");
const { executeFile } = require("./executeFile");
const cors = require('cors');


app.use(cors());
// allow_origins=["http://localhost:5173"];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/run', async (req, res) => {
    // Destructure way to write the code
    // Here language == extension [ Directly extension is send from frontend ]  
    const { language='cpp', code, input} = req.body;

    if(!(code && language)) {
        return res.status(400).json({
            success: false,
            message: "Code and language are required",
        })
    }

    try {
        const filePath = generateFile(language, code);
        const inputFilePath = generateInputFile(input);
        if(!filePath) return res.status(404).json({
            success: false,
            message: "File not found",
        })

        const output = await executeFile(filePath, inputFilePath, language);
        const cleanedOutput = output.replace(/\r\n/g, '\n').trim();
        // const cleanedOutput = output.toString();

        return res.status(200).json({
            success: true,
            message: "File generated successfully",
            filePath,
            inputFilePath : inputFilePath,
            output: cleanedOutput,
        })
    }
    catch (error) {
        console.error("Execution Error : ", error.stderr || error.error || error);


        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
})

// Submit Route
// app.post('/submit', (req, res) => {
//     const { code, language } = req.body;

// })


app.listen(port, () => {
    console.log(`Server is running on Port : ${port}`);
})