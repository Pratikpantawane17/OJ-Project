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
      // secure: process.env.NODE_ENV === 'production', // Use secure in production
      sameSite: 'strict'
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




module.exports = router;
