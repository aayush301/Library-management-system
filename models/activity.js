const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
	category: {
		type: String,
		enum: ["issue", "return", "addBook", "updateBook", "updateAdminProfile", "updateStudentProfile"],
		required: true
	},
	activityTime: {
		type: Date,
		default: Date.now
	},
	admin: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users"
	},
	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users"
	},
	book: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "books"
	},
	loan: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "loans"
	}
});

const Activity = mongoose.model("activities", activitySchema);
module.exports = Activity;