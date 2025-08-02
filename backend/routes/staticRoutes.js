const express = require("express");
const router = express.Router(); 
const bcrypt = require('bcryptjs');
const { setUser, getUser }= require('../service/auth');
const Problem = require("../models/Problem");
const User = require("../models/User")
const Submission = require("../models/Submission")



router.post('/signup', async (req, res) => {
    try {
        const { fullname, email, username, password } = req.body;

        // validation of fields : Done in frontend...
        if(!(fullname && email && username && password)) return res.status(400).end("Fill all the Fields !");
        
        // Check user is already present ?
        const exits = await User.findOne({email});
        if(exits) return res.status(400).end("User already Exits with same Email...");
        
        // hashing / encrypt password....
        const hashedPassword = await bcrypt.hash(password, 8);

        // save user in DB
        const user = await User.create({
            fullname,
            email,
            username,
            password: hashedPassword,
        })

        // Generate token for user and dsend it....
        // const token = jwt.sign({id: user._id}, process.env.SECRET_KEY, {
        //     expiresIn: "1h",
        // });

        // req.cookies = token;
        // user.token = token;
        
        user.password = undefined;
        res.status(200).json({
            message : 'You have successfully Registered', 
            user,
        });

        // res.redirect('/login');
    } 
    catch (err) {
      console.error("Signup Error:", err);
      return res.status(500).json({ error: err.message || 'An error occurred' });
    }
});


router.post('/login', async (req, res) => {
  const { email, password, rememberMe  } = req.body;

  if (!(email && password)) {
    return res.status(400).json({ message: "Please enter both fields." });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found. Please sign up first." });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: "Incorrect password." });
  }

  let maxAge;
  if (rememberMe) {
    maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  } else {
    maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  // Token generation logic
  const token = setUser(user); 
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: maxAge
  });

  return res.status(200).json({ message: "Login successful" });
});

// add necessary things
router.get('/stats', async (req, res) => {
 try {
   // 1) Get count of all problems, users, and submissions
   const [problemCount, userCount, submissionCount] = await Promise.all([
     Problem.countDocuments(),
     User.countDocuments(),
     Submission.countDocuments()
   ]);

   // 2) Send it to frontend
   res.json({
     success: true,
     data: {
       problems: problemCount,
       users: userCount,
       submissions: submissionCount
     }
   });
 } catch (error) {
   console.error('Error fetching stats:', error);
   res.status(500).json({
     success: false,
     message: 'Failed to fetch statistics',
     data: {
       problems: 0,
       users: 0,
       submissions: 0
     }
   });
 }
});


module.exports = router;
