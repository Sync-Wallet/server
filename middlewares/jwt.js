const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const secret = process.env.JWT_SECRET;

const checkAuth = async (req, res, next) => {
	const token = req.headers.authorization.split(" ")[1];

	try {
		if (!token) {
			res.status(401).send("Unauthorized: No token provided");
		}

		const decoded = jwt.verify(token, secret);
		const user = await UserModel.findOne(decoded._id);

		if (!user) {
			res.status(401).json({
				success: false,
				status: 401,
				message: "Unauthorized: Invalid token"
			});
		}

		user.password = undefined;
		req.user = user;

		next();
	} catch (err) {
		if (err instanceof jwt.JsonWebTokenError) {
			const err = new Error('Unauthorized');
			err.status = 401;
			next(err);
		} else {
			next(err);
		}
	}
}


module.exports = checkAuth;
