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
    fs.writeFileSync(filePath, code); 
    return filePath;
}

module.exports = {
    generateFile,
};
