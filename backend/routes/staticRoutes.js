const express = require("express");
const router = express.Router(); 
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { setUser, getUser }= require('../service/auth');


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
  const { email, password } = req.body;

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

  // Token generation logic
  const token = setUser(user); 
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  return res.status(200).json({ message: "Login successful" });
});


module.exports = router;
