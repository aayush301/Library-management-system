const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Book = require("../models/book.js");
const Loan = require("../models/loan.js");
const Activity = require("../models/activity.js");


router.get("/student/dashboard", middleware.ensureStudentLoggedIn, async (req,res) => {
	try
	{
		await Loan.updateMany({ status: "issued", dueTime: { $lt: new Date() } }, {status: "overdue"});
		const numStudents = await User.countDocuments({ role: "student" });
		const books = await Book.find();
		const numDistinctBooks = books.length;
		const numTotalBooks = books.reduce((total, book) => total + book.copiesOwned, 0);
		const numBooksNotReturned = await Loan.countDocuments({ user: req.user._id, status: ["issued", "overdue"] });
		const numBooksOverdue = await Loan.countDocuments({ user: req.user._id, status: "overdue" });
		
		res.render("student/dashboard", {
			title: "Dashboard",
			numStudents, numDistinctBooks, numTotalBooks, numBooksNotReturned, numBooksOverdue
		});
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/student/activities", middleware.ensureStudentLoggedIn, async (req,res) => {
	try
	{
		const filterObj = { $or: [
			{ category: ["issue", "return", "updateStudentProfile"], student: req.user._id },
			{ category: ["addBook", "updateBook"] }
		]};
		const activities = await Activity.find(filterObj).populate("student").populate("book").sort("-activityTime");
		res.render("student/activities", { title: "Activities", activities });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/student/books", middleware.ensureStudentLoggedIn, async (req,res) => {
	try
	{
		// console.log(req.query);
		const filterObj = {};
		const filter = req.query.filter;
		const sortString = req.query.sortBy;
		if(filter)
		{
			filterObj.title = new RegExp(filter.title, 'i');
			filterObj.authors = new RegExp(filter.authors, 'i');
			filterObj.category = new RegExp(filter.category, 'i');
			if(filter.available || filter.unavailable)
				filterObj.$or = [];
			else
				filterObj.stock = -1;
			if(filter.available)
				filterObj.$or.push({stock: {$gte: 1}});
			if(filter.unavailable)
				filterObj.$or.push({stock: {$eq: 0}});
		}
		
		// console.log(filterObj);
		const books = await Book.find(filterObj).sort(sortString);
		res.render("student/books", { title: "Books", books });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/student/loans/current", middleware.ensureStudentLoggedIn, async (req,res) => {
	try
	{
		const studentId = req.user._id;
		await Loan.updateMany({ status: "issued", dueTime: { $lt: new Date() } }, {status: "overdue"});
		const currentLoans = await Loan.find({ user: studentId, status: { $in: ["issued", "overdue"] } }).populate("book");
		res.render("student/currentLoans", { title: "Current Loans", currentLoans });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/student/loans/previous", middleware.ensureStudentLoggedIn, async (req,res) => {
	try
	{
		const studentId = req.user._id;
		const previousLoans = await Loan.find({ user: studentId, status: "returned" }).populate("book").sort("-returnTime");
		res.render("student/previousLoans", { title: "Previous loans", previousLoans });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/student/rules", middleware.ensureStudentLoggedIn, (req,res) => {
	res.render("student/rules", { title: "Rules and Regulations" });
});

router.get("/student/profile", middleware.ensureStudentLoggedIn, (req,res) => {
	res.render("student/profile", { title: "My Profile" });
});

router.put("/student/profile", middleware.ensureStudentLoggedIn, async (req,res) => {
	const id = req.user._id;
	const updateObj = req.body.student;	// updateObj: {firstName, lastName, gender, address, phone}
	try
	{
		await User.findByIdAndUpdate(id, updateObj);
		const newActivity = new Activity({
			category: "updateStudentProfile",
			student: req.user._id,
		});
		await newActivity.save();
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/student/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});



module.exports = router;