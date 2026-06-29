// const fs = require("fs");
// const path = require("path");
// const { exec } = require("child_process");

// const outputPath = path.join(__dirname, "outputs");  //D:\ALgoU compiler\compiler/outputs
// if(!fs.existsSync(outputPath)) {
//     fs.mkdirSync(outputPath, {recursive: true});
// }

// const executeFile = (filePath, inputFilePath, language) => {   //D:\ALgoU compiler\compiler/e7831ad8-fe00-4c2e-ac94-4108bd5fbd9c.cpp

//     //Command = when we run a file we change the directory Run the file by using g++ then executable file is generated then we run that executable file in order to get the output same is replicate in below code : 
//     // command = g++ ${filePath} -o ${outPath} && cd ${outputPath} && ./${outputFileName}  --- (for linux/macOS)
//     // command = g++ ${filePath} -o ${outPath} && ${outputFileName} --- (for Windows)
//     // console.log("Running:", command);

//     let command;

//     switch(language) {
//         case "cpp": 
//             const jobId = path.basename(filePath).split(".")[0];
//             const outputFileName = `${jobId}.exe`;  //e7831ad8-fe00-4c2e-ac94-4108bd5fbd9c.cpp
//             // const outputFileName = `${jobId}.out`;
//             const outPath = path.join(outputPath, outputFileName);
    
//             console.log("Output File Path : ", outPath);
//             command = `g++ "${filePath}" -o "${outPath}" && "${outPath}" < "${inputFilePath}"`;
//             break;
    
//         case "py":
//             command = `python "${filePath}" < "${inputFilePath}"`;
//             break;
        
//         case "java":
//             command = `java "${filePath}" < "${inputFilePath}"`;
//             break;
    
//         case "js":
//             command = `node "${filePath}" "${inputFilePath}"`;
//             console.log("Inside the command", command)
//             break;
    
//         default:
//             throw new Error("Unsupported Language");
//     }

//     return new Promise((resolve, reject) => {
//         exec(command, (error, stdout, stderr) => {
//             // if (error) {
//             //     console.log("Running command:", command);
//             //     console.error("Compilation or runtime error:", stderr);
//             //     reject(stderr || error.message);
//             // } else {

//             //     console.log("Execution Output:", stdout);
//             //     resolve(stdout);
//             // }

//              if (error) {
//         console.log("Running command:", command);
//         console.error("Compilation or runtime error:", error);
//         console.error("stderr:", stderr);
//         reject(stderr || error.message);
//     } else {
//         console.log("Execution Output:", stdout);
//         resolve(stdout);
//     }
//         });
//     });
// };

// module.exports = {
//     executeFile,
// }


// **************** Creating / Spinning up new docker container for every submission - for security from malicious code ****************

const Docker = require('dockerode');
const path = require('path');

// Connect to Docker daemon via Unix socket (DooD — Docker-out-of-Docker pattern)
// /var/run/docker.sock is mounted from EC2 host into the compiler pod via k8s manifest
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const executeFile = (filePath, inputFilePath, language) => {   //e.g. /app/codes/e7831ad8-fe00-4c2e-ac94-4108bd5fbd9c.cpp

  const jobId = path.basename(filePath).split('.')[0];  // e7831ad8-fe00-4c2e-ac94-4108bd5fbd9c
  const codesDir = path.dirname(filePath);              // /app/codes — mounted as /code inside container
  const inputsDir = path.dirname(inputFilePath);        // /app/inputs — mounted as /inputs inside container

  // Command = when we run a file we change the directory, run the file using g++,
  // then the executable is generated, then we run that executable to get the output
  // Same logic as before but now running inside an isolated Docker container:
  // cmd = g++ /code/<file>.cpp -o /code/<jobId>.out && /code/<jobId>.out < /inputs/<input>
  let cmd;

  switch (language) {
    case 'cpp':
      // compile with g++ → produce .out → run .out with stdin redirected from input file
      cmd = `g++ /code/${path.basename(filePath)} -o /code/${jobId}.out && /code/${jobId}.out < /inputs/${path.basename(inputFilePath)}`;
      console.log("Output File Path: ", `/code/${jobId}.out`);
      break;

    case 'py':
      cmd = `python3 /code/${path.basename(filePath)} < /inputs/${path.basename(inputFilePath)}`;
      break;

    case 'java':
      // javac compiles → java runs from /code directory using -cp (classpath)
      cmd = `javac /code/${path.basename(filePath)} && java -cp /code Main < /inputs/${path.basename(inputFilePath)}`;
      break;

    case 'js':
      cmd = `node /code/${path.basename(filePath)} < /inputs/${path.basename(inputFilePath)}`;
      console.log("Inside the command", cmd);
      break;

    default:
      return Promise.reject(new Error('Unsupported Language'));
  }

  return new Promise(async (resolve, reject) => {
    try {
      const container = await docker.createContainer({
        Image: 'gcc:latest',           // image that has g++, python3, java
        Cmd: ['sh', '-c', cmd],
        HostConfig: {
          Binds: [
            `${codesDir}:/code`,       // mount your codes/ folder into container
            `${inputsDir}:/inputs`,    // mount your inputs/ folder into container
          ],
          Memory: 128 * 1024 * 1024,  // hard RAM limit: 128 MB per submission
          CpuQuota: 50000,            // max 50% of one CPU core
          NetworkMode: 'none',        // no internet access inside container
          AutoRemove: true,           // container auto-deletes after execution
        },
        AttachStdout: true,
        AttachStderr: true,
      });

      await container.start();

      // follow: true means stream logs as they come, not after container exits
      const logs = await container.logs({
        follow: true,
        stdout: true,
        stderr: true,
      });

      let stdout = '';
      let stderr = '';

      logs.on('data', (chunk) => {
        // Docker multiplexes stdout+stderr into one stream
        // First byte of each chunk tells us which stream: 1=stdout, 2=stderr
        const type = chunk[0];
        const content = chunk.slice(8).toString(); // skip 8-byte Docker header
        if (type === 1) stdout += content;
        else stderr += content;
      });

      logs.on('end', () => {
        if (stderr) {
          console.error("Compilation or runtime error:", stderr);
          return reject(stderr);
        }
        console.log("Execution Output:", stdout);
        resolve(stdout);
      });

      logs.on('error', (err) => reject(err.message));

    } catch (err) {
      reject(err.message);
    }
  });
};

module.exports = { executeFile };