var express = require("express");
const { registerValidation, loginValidation } = require('../helpers/validation');
const AuthController = require("../controllers/AuthController");
const checkauth = require("../middlewares/jwt");
const { sendOTP } = require("../helpers/mailer");

var router = express.Router();

router.post("/register", registerValidation, AuthController.register, sendOTP);
router.post('/verify', AuthController.verifyOTP);
router.post("/login", loginValidation, checkauth, AuthController.login)
// router.get("/test", (req, res) => { res.send("Hello World!"); });


module.exports = router;
