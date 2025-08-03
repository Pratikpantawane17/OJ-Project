const express = require("express");
const Problem = require("../models/Problem");
const User = require("../models/User")
const Submission = require("../models/Submission")
const ProblemSolved = require("../models/ProblemSolved");
const router = express.Router();
const { generateAiResponse } = require("./generateAiResponse")

// Home Page Backend
router.get('/', async (req, res) => {
    const userData = await User.findOne({ _id: req.user._id })
    // console.log("User Data: ", userData);

    return res.status(200).json({
        success: true,
        user : true,
        userData,
    })
}); 


router.get('/problemlist', async (req, res) => {
    try {
      const problemDetails = await Problem.find({}, {
        title: 1,
        tags: 1,
        difficulty: 1,
      });
 
      return res.status(200).json({
        success: true,
        message: "Problems fetched successfully",
        problemDetails,
        role : req.user.role,
      });
    } 

    catch (error) {
      console.error("Error while fetching problems:", error);
  
      return res.status(500).json({
        success: false,
        message: "Failed to fetch problem list",
        error: error.message,
      });
    }
});
  

router.get('/problemlist/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const problem = await Problem.findById(id);

    // console.log(problem);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }
  
    return res.status(200).json({
      success: true,
      problem,
      role : req.user.role,
    });
  } 
  catch (error) {
    console.error("Error fetching problem:", error); 
    return res.status(500).json({  
      success: false,
      message: "Something went wrong!",
    });
  }
});

router.post('/logout', (req, res) => {
  try {
    
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    
    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout"
    });
  }

});


// Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user._id;


    // 1. Get all solved problems by the user
    const solvedProblems = await ProblemSolved.find({ userId })
      .populate('problemId', 'title difficulty _id')
      .sort({ dateSolved: -1 });


    // 2. Get all submissions by the user
    const allSubmissions = await Submission.find({ userId });

    // console.log("All Submissions:", allSubmissions);
    // 3. Calculate basic counts
    const problemCount = solvedProblems.length;
    const submissionCount = allSubmissions.length;
   

    // 4. Calculate difficulty-wise counts
    let easy = 0, medium = 0, hard = 0;
    
    solvedProblems.forEach(solved => {
      const difficulty = solved.problemId?.difficulty || 'Easy';
      switch (difficulty.toLowerCase()) {
        case 'easy':
          easy++;
          break;
        case 'medium':
          medium++;
          break;
        case 'hard':
          hard++;
          break;
        default:
          easy++; // Default to easy if difficulty is unclear
      }
    });

    // 5. Calculate acceptance rate
    const acceptedSubmissions = allSubmissions.filter(
      submission => submission.status === 'Accepted' || submission.verdict === 'Accepted'
    ).length;
    
    const acceptanceRate = submissionCount > 0 
      ? (acceptedSubmissions / submissionCount) * 100 
      : 0;

    // 6. Get total difficulty counts from problems schema
    const totalEasyProblems = await Problem.countDocuments({ difficulty: { $regex: /^easy$/i } });
    const totalMediumProblems = await Problem.countDocuments({ difficulty: { $regex: /^medium$/i } });
    const totalHardProblems = await Problem.countDocuments({ difficulty: { $regex: /^hard$/i } });

    if (solvedProblems.length > 0) {
  console.log("Date and Time:", solvedProblems[0].createdAt);
}
    // 7. Format solved problems for frontend
    const formattedSolvedProblems = solvedProblems.map(solved => ({
      title: solved.problemId?.title || 'Unknown Problem',
      id: solved.problemId?._id?.toString() || solved.problemId,
      dateSolved: solved.createdAt
        ? new Date(solved.createdAt).toISOString().split('T')[0]
        : null,
      difficulty: solved.problemId?.difficulty || 'Easy'
    }));


    // 8. Calculate max streak
    const calculateMaxStreak = (problems) => {
      if (problems.length === 0) return 0;

      const sortedDates = [...new Set(
        problems.map(p => new Date(p.dateSolved).toDateString())
      )].sort((a, b) => new Date(a) - new Date(b));

      let maxStreak = 1;
      let currentStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        if (diff === 1) currentStreak++;
        else currentStreak = 1;
        maxStreak = Math.max(maxStreak, currentStreak);
      }

      return maxStreak;
    };

    // 9. Calculate active days (unique submission/solving dates)
    const calculateActiveDays = (problems) => {
      if (problems.length === 0) return 0;
      return new Set(problems.map(p => p.dateSolved)).size;
    };

    const maxStreak = calculateMaxStreak(formattedSolvedProblems);
    const activeDays = calculateActiveDays(formattedSolvedProblems);

    // 10. Prepare response data
    const dashboardData = {
      problemData: {
        problemCount,
        easy,
        medium,
        hard,
        solvedProblems: formattedSolvedProblems,
        submissionCount,
        acceptanceRate: Math.round(acceptanceRate * 10) / 10, // Round to 1 decimal place
        maxStreak,
        activeDays,
        difficultyTotals: {
          Easy: totalEasyProblems,
          Medium: totalMediumProblems,
          Hard: totalHardProblems
        }
      }
    };

    // 11. Send successful response
    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      ...dashboardData
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    
    // Return error response with fallback data structure
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
      problemData: {
        problemCount: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        solvedProblems: [],
        submissionCount: 0,
        acceptanceRate: 0,
        maxStreak: 0,
        activeDays: 0,
        difficultyTotals: {
          Easy: 0,
          Medium: 0,
          Hard: 0
        }
      }
    });
  }
});

// AI recommendation
router.post('/ai-recommendation', async (req, res) => {
    const problem = req.body.problemData;
    const submission = req.body.submission;
    // const {problem, submission} = req.body;

    // console.log(submission);
    
    if(!submission.code || submission.code.trim() == '') {
      return res.status(400).json({
        success: false,
        message: "Code is empty!",
      });
    }

    try {
        const aiResponse = await generateAiResponse(problem, submission);

        // console.log(aiResponse);

        return res.status(200).json({
          success: true,
          message: "AI review generated successfully.",
          aiResponse,
        });
    } 
    catch (error) {
      console.log("Error : ", error);

      return res.status(500).json({
        success: false,
        message: "Error occur! Fail to get AI review",
      });
    }
})

module.exports = router;
