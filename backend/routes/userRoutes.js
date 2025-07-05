const express = require("express");
const Problem = require("../models/Problem");
const router = express.Router();

// Home Page Backend
router.get('/', (req, res) => {
    return res.status(200).json({
        user : true,
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
  



module.exports = router;