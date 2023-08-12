const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		max: 100,
	},
	name: {
		type: String,
		required: true,
		max: 100,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		max: 100
	},

	password: {
		type: String,
		required: true
	},

	isVerified: {
		type: Boolean,
		default: false
	},

	lastLogin: {
		type: Date,
		default: Date.now,
	},

},
	{ timestamps: true }
);


UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

UserSchema.methods.comparePassword = async function (password) {
	try {
		return await bcrypt.compare(password, this.password);
	} catch (error) {
		throw new Error(error);
	}
};

module.exports = mongoose.model("User", UserSchema);
