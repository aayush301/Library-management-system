const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
	book: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "books",
		required: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
		required: true
	},
	issueTime: {
		type: Date,
		default: Date.now
	},
	dueTime: {
		type: Date,
		default: () => Date.now() + 7*24*60*60*1000
	},
	returnTime: {
		type: Date
	},
	status: {
		type: String,
		enum: ["issued", "returned", "overdue"]
	}
});

const Loan = mongoose.model("loans", loanSchema);
module.exports = Loan;