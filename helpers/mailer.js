const nodemailer = require("nodemailer");
const { otpTemplate } = require("../templates/otpTemplate");
const utility = require("./utility");
const userOTPModel = require("../models/userOTPModel");

exports.sendOTP = async (uid, req, res, next) => {
	const config = {
		service: 'gmail',
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD,
		},
	};
	const transporter = nodemailer.createTransport(config);
	const OTP = utility.randomNumber(6); // generate OTP of 4 digits

	const otpData = new userOTPModel({
		userid: uid,
		otp: OTP,  
	});

	await otpData.save();  // save the OTP in database for verification

	const message = {
		from: process.env.EMAIL,
		to: req.body.email,
		subject: 'Welcome to Sync Wallet App',
		html: otpTemplate(OTP),
	};

	await transporter.sendMail(message).then(() => {
		return res.status(200).json({
			success: true,
			message: "A verification email has been sent to " + req.body.email + ".",
		});
	}).catch((err) => {
		return res.status(500).json({
			success: false,
			message: "Unable to send email.",
			error: err.message
		});
	});
}