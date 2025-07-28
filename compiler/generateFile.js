const fs = require("fs");
const path = require("path");
const {v4 : uuid} = require("uuid")


const dirCode = path.join(__dirname, "codes");  //D:\ALgoU compiler\compiler/codes

if(!fs.existsSync(dirCode)) {
    fs.mkdirSync(dirCode, {recursive : true});
}

const generateFile = (language, code) => {
    const jobId = uuid();  //fhsdghsagfjsdfhfsdf
    const fileName = `${jobId}.${language}`;   // fhsdghsagfjsdfhfsdf.cpp
    const filePath = path.join(dirCode, fileName);  //D:\ALgoU compiler\compiler/codes/fhsdghsagfjsdfhfsdf.cpp
    
     let finalCode = code;
     console.log("Lanugae : ", language);
     
    if (language === "js") {
    finalCode = `
const fs = require('fs');
let __algoarena_input__ = '';
if (process.argv[2]) {
    __algoarena_input__ = fs.readFileSync(process.argv[2], 'utf8');
}
${code}
    `.trim();
}

    fs.writeFileSync(filePath, finalCode);
    return filePath;
}

module.exports = {
    generateFile,
};
