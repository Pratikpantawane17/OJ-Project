const express = require("express");
const router = express.Router();

// Home Page Backend
router.get('/', (req, res) => {
    return res.status(200).json({
        user : true,
    })
});



module.exports = router;