const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const dirInputs = path.join(__dirname, 'inputs');

if (!fs.existsSync(dirInputs)) {
    fs.mkdirSync(dirInputs, { recursive: true });
}

// Creates a temporary file with user's input data
const generateInputFile =  (input = "") => {

    const jobId = uuid();
    const inputFileName = `${jobId}.txt`;
    const inputFilePath = path.join(dirInputs, inputFileName);
    // fs.writeFileSync(inputFilePath, JSON.stringify(input));
    fs.writeFileSync(inputFilePath, input);

    console.log("Input File Path : ", inputFilePath);
    console.log("Input : ", input);
    
    return inputFilePath;
};

module.exports = {
    generateInputFile,
};