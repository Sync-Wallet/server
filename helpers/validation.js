const apiResponse = require("../helpers/apiResponse");

const validateEmail = (email) => {
    // var re = /\S+@\S+\.\S+/;
    // return re.test(email);
}

const registerValidation = (req, res, next) => {
    const { name, username, email, password } = req.body;

    if (!name || name.length < 3) {
        return apiResponse.validationErrorWithData(res, "Name is required and should be minimum 3 characters long.", {});
    }

    if (!username || username.length < 3) {
        return apiResponse.validationErrorWithData(res, "Username is required and should be minimum 3 characters long.", {});
    }

    if (!email || validateEmail(email)) {
        return apiResponse.validationErrorWithData(res, "Please enter a valid email.", {});
    }

    if (!password || password.length < 6) {
        return apiResponse.validationErrorWithData(res, "Password is required and should be minimum 6 characters long.", {});
    }

    next();
}

const loginValidation = (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        return apiResponse.validationErrorWithData(res, "Username or email is required.", {});
    }

    if (!password || password.length < 6) {
        return apiResponse.validationErrorWithData(res, "Password is required and should be minimum 6 characters long.", {});
    }

    next();
}

module.exports = {
    registerValidation,
    loginValidation
};
