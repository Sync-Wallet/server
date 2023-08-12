const UserModel = require("../models/UserModel");
const userOTPModel = require("../models/userOTPModel");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.register = async (req, res, next) => {
    try {
        const { name, username, email, password } = req.body;

        const user = await UserModel.findOne({ $or: [{ email }, { username }] });  // check if the user already exists

        if (user) {
            return apiResponse.validationErrorWithData(res, "User already exists with this email/username.", {});
        }

        const token = jwt.sign(req.body, process.env.JWT_SECRET, { expiresIn: '30d' })

        const newUser = new UserModel({
            name,
            username,
            email,
            password,
        });
        // mailer.sendEmail(email);

        await newUser.save();  // save the user
        newUser.password = undefined;  // remove the password from the response

        const uid = newUser._id;
        next(uid);

    } catch (err) {
        next(err);
    }
}

exports.verifyOTP = async (req, res, next) => {
    try {
        const { email, username, otp } = req.body;
        const user = await UserModel.findOne({ $or: [{ email }, { username }] });  // check if the user already exists
        const otpData = await userOTPModel.findOne({ userid: user._id });

        

        if (!user || !otpData) {
            return apiResponse.validationErrorWithData(res, "User not found.", {});
        }

        if (otpData.tries >= 10) {
            return apiResponse.validationErrorWithData(res, "Maximum tries exceeded.", {});
        }

        if (otpData.otp !== otp) {
            otpData.tries++;
            await otpData.save();
            return apiResponse.validationErrorWithData(res, "Incorrect OTP.", {});
        }

        const token = jwt.sign({ name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' });

        user.isVerified = true;
        await user.save();
        await otpData.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Account verified.",
            token: token,
            user: user,
        });
    } catch (err) {
        next(err);
    }
}

exports.login = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = await UserModel.findOne({ $or: [{ email }, { username }] });

        if (!user) {
            return apiResponse.unauthorizedResponse(res, "User not found.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password.",
            })
        }

        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.name !== user.name) {
            return apiResponse.unauthorizedResponse(res, "Invalid token.");
        }

        user.password = undefined;

        return res.status(200).json({
            success: true,
            message: "Login Success.",
            token: token,
            user: user,
        });

    } catch (err) {
        next(err);
    }
}
