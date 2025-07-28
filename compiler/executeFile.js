const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const outputPath = path.join(__dirname, "outputs");  //D:\ALgoU compiler\compiler/outputs
if(!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, {recursive: true});
}

const executeFile = (filePath, inputFilePath, language) => {   //D:\ALgoU compiler\compiler/e7831ad8-fe00-4c2e-ac94-4108bd5fbd9c.cpp

    //Command = when we run a file we change the directory Run the file by using g++ then executable file is generated then we run that executable file in order to get the output same is replicate in below code : 
    // command = g++ ${filePath} -o ${outPath} && cd ${outputPath} && ./${outputFileName}  --- (for linux/macOS)
    // command = g++ ${filePath} -o ${outPath} && ${outputFileName} --- (for Windows)
    // console.log("Running:", command);

    let command;

    switch(language) {
        case "cpp": 
            const jobId = path.basename(filePath).split(".")[0];
            const outputFileName = `${jobId}.exe`;  //e7831ad8-fe00-4c2e-ac94-4108bd5fbd9c.cpp
            // const outputFileName = `${jobId}.out`;
            const outPath = path.join(outputPath, outputFileName);
    
            console.log("Output File Path : ", outPath);
            command = `g++ "${filePath}" -o "${outPath}" && "${outPath}" < "${inputFilePath}"`;
            break;
    
        case "py":
            command = `python "${filePath}" < "${inputFilePath}"`;
            break;
        
        case "java":
            command = `java "${filePath}" < "${inputFilePath}"`;
            break;
    
        case "js":
            command = `node "${filePath}" "${inputFilePath}"`;
            console.log("Inside the command", command)
            break;
    
        default:
            throw new Error("Unsupported Language");
    }

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            // if (error) {
            //     console.log("Running command:", command);
            //     console.error("Compilation or runtime error:", stderr);
            //     reject(stderr || error.message);
            // } else {

            //     console.log("Execution Output:", stdout);
            //     resolve(stdout);
            // }

             if (error) {
        console.log("Running command:", command);
        console.error("Compilation or runtime error:", error);
        console.error("stderr:", stderr);
        reject(stderr || error.message);
    } else {
        console.log("Execution Output:", stdout);
        resolve(stdout);
    }
        });
    });
};

module.exports = {
    executeFile,
}