const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
dotenv.config();
const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_GEMINI_KEY});

// Helper Function....
const truncate = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

const generateAiResponse = async (problem, submission) => {
   const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",

    contents: submission.verdict === 'Accepted' ? `Given this code:${submission.code}
    And the problem titled "${problem.title}", with:
- Short Description: ${problem.statement.slice(0, 500)}
- Constraints: ${problem.constraints}
- Sample Test Case: ${problem.sampleTestcases[0]}

Analyze and estimate time and space complexity in short.
Then, in 2 lines, suggest if a better algorithm or data structure could improve the code. No explanation or code required.
` : `User submitted the following C++ code for this problem:

Title: ${problem.title}  
Description (short): ${truncate(problem.statement, 300)}  
Constraints: ${problem.constraints}  
Sample Case: ${problem.sampleTestcases[0]}  

Current Code:
${submission.code}

Failed on:
Input: ${submission.failedTestCase.input}  
Expected: ${submission.failedTestCase.expectedOutput}  
Got: ${submission.failedTestCase.output}

➡️ Find the likely mistake based on the above.
Reply with only a short explanation (max 3 lines). No fixed code.`

  });
  
  return response.text;
}

module.exports = {
    generateAiResponse,
}