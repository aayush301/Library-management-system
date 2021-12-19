const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Book = require("../models/book.js");
const Loan = require("../models/loan.js");
const Activity = require("../models/activity.js");
const nodemailer = require("nodemailer");


router.get("/admin/dashboard", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		await Loan.updateMany({ status: "issued", dueTime: { $lt: new Date() } }, {status: "overdue"});
		const numStudents = await User.countDocuments({ role: "student" });
		const numAdmins = await User.countDocuments({ role: "admin" });
		const books = await Book.find();
		const numDistinctBooks = books.length;
		const numTotalBooks = books.reduce((total, book) => total + book.copiesOwned, 0);
		const numBooksNotReturned = await Loan.countDocuments({ status: ["issued", "overdue"] });
		const numBooksOverdue = await Loan.countDocuments({ status: "overdue" });
		
		res.render("admin/dashboard", {
			title: "Dashboard",
			numStudents, numAdmins, numDistinctBooks, numTotalBooks, numBooksNotReturned, numBooksOverdue
		});
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/activities", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const activities = await Activity.find().populate("admin").populate("student").populate("book").sort("-activityTime");
		res.render("admin/activities", { title: "Activities", activities });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/students", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const students = await User.find({role:"student"});
		res.render("admin/students", { title: "Students", students });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/books", middleware.ensureAdminLoggedIn, async (req,res) => {
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
			filterObj.copiesOwned = {$gte: 0};
			filterObj.stock = {$gte: 0};
			if(filter.minCopiesOwned)
				filterObj.copiesOwned.$gte = filter.minCopiesOwned;
			if(filter.maxCopiesOwned)
				filterObj.copiesOwned.$lte = filter.maxCopiesOwned;
			if(filter.minStock)
				filterObj.stock.$gte = filter.minStock;
			if(filter.maxStock)
				filterObj.stock.$lte = filter.maxStock;
		}
		
		// console.log(filterObj);
		const books = await Book.find(filterObj).sort(sortString);
		res.render("admin/books", { title: "Books", books });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/books/add", middleware.ensureAdminLoggedIn, (req,res) => {
	res.render("admin/addBook", { title: "Add Book" });
});

router.post("/admin/books/add", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const book = req.body.book;
		if(book.ISBN.toString().length != 13)
		{
			req.flash("error", "ISBN should be of length 13");
			return res.redirect("back");
		}
		book.stock = book.copiesOwned;
		const newBook = new Book(book);
		await newBook.save();
		
		const newActivity = new Activity({
			category: "addBook",
			admin: req.user._id,
			book: newBook._id
		});
		await newActivity.save();
		
		req.flash("success", "Book added successfully");
		res.redirect("/admin/books");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/book/:bookId", middleware.ensureAdminLoggedIn, async (req,res) => {
	const bookId = req.params.bookId;
	try
	{
		const book = await Book.findById(bookId);
		res.render("admin/updateBook", { title: "Update Book", book });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.put("/admin/book/:bookId", middleware.ensureAdminLoggedIn, async (req,res) => {
	const bookId = req.params.bookId;
	const updateObj = req.body.book;
	if(updateObj.ISBN.toString().length != 13)
	{
		req.flash("error", "ISBN should be of length 13");
		return res.redirect("back");
	}
	try
	{
		const prevObj = await Book.findById(bookId);
		updateObj.stock = prevObj.stock;
		const diff = updateObj.copiesOwned - prevObj.copiesOwned;
		if(diff >= 0)
		{
			updateObj.stock += diff;
			await Book.findByIdAndUpdate(bookId, updateObj);
			const newActivity = new Activity({
				category: "updateBook",
				admin: req.user._id,
				book: bookId
			});
			await newActivity.save();
			req.flash("success", "Book updated successfully");
			res.redirect("/admin/books");
		}
		else
		{
			if(prevObj.stock >= Math.abs(diff))
			{
				updateObj.stock += diff;
				await Book.findByIdAndUpdate(bookId, updateObj);
				const newActivity = new Activity({
					category: "updateBook",
					admin: req.user._id,
					book: bookId
				});
				await newActivity.save();
				req.flash("success", "Book updated successfully");
				res.redirect("/admin/books");
			}
			else
			{
				req.flash("error", "Couldn't update books!!\n Books are not returned by the students!!");
				res.redirect(`/admin/book/${bookId}`);
			}
		}
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.delete("/admin/book/:bookId", middleware.ensureAdminLoggedIn, async (req,res) => {
	const bookId = req.params.bookId;
	try
	{
		const book = await Book.findById(bookId);
		if(book.stock != book.copiesOwned)
		{
			req.flash("error", "All copies of the book haven't come to library");
			return res.redirect("back");
		}
		await Book.findByIdAndDelete(bookId);
		await Loan.deleteMany({ book: bookId });
		await Activity.deleteMany({ book: bookId });
		req.flash("success", "Book deleted successfully");
		res.redirect("/admin/books");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/issue", middleware.ensureAdminLoggedIn, async (req,res) => {
	res.render("admin/issueBook", { title: "Issue Book" });
});

router.post("/admin/issue", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const email = req.body.email;
		const ISBN = req.body.ISBN;
		const student = await User.findOne({email, role: "student"});
		if(!student)
		{
			req.flash("error", "Book can't be issued.. Student not registered");
			return res.redirect("back");
		}
		
		const book = await Book.findOne({ISBN});
		if(!book)
		{
			req.flash("error", "Book can't be issued.. Book with given ISBN not found");
			return res.redirect("back");
		}
		if(book.stock == 0)
		{
			req.flash("error", "Book can't be issued.. Stock is 0");
			return res.redirect("back");
		}
		
		const newLoan = new Loan({ book: book._id, user: student._id, status: "issued" });
		await newLoan.save();
		await Book.findByIdAndUpdate(book.id, { $inc: { stock: -1 } });
		
		const newActivity = new Activity({
			category: "issue",
			admin: req.user._id,
			student: student._id,
			book: book._id,
			loan: newLoan._id
		});
		await newActivity.save();
		
		req.flash("success", "Book issued successfully");
		res.redirect("back");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/collectBook/:loanId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const loanId = req.params.loanId;
		const loan = await Loan.findById(loanId);
		loan.status = "returned";
		loan.returnTime = Date.now();
		loan.save();
		await Book.findByIdAndUpdate(loan.book, { $inc: { stock: 1 } });
		
		const newActivity = new Activity({
			category: "return",
			admin: req.user._id,
			student: loan.user,
			book: loan.book,
			loan: loanId
		});
		await newActivity.save();
		
		req.flash("success", "Book returned successfully");
		res.redirect("/admin/loans/current");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/loans/current", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		await Loan.updateMany({ status: "issued", dueTime: { $lt: new Date() } }, {status: "overdue"});
		const currentLoans = await Loan.find({ status: { $in: ["issued", "overdue"] } }).populate("book").populate("user");
		res.render("admin/currentLoans", { title: "Current Loans", currentLoans });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/loans/previous", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const previousLoans = await Loan.find({ status: "returned" }).populate("book").populate("user").sort("-returnTime");
		res.render("admin/previousLoans", { title: "Previous loans", previousLoans });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/profile", middleware.ensureAdminLoggedIn, (req,res) => {
	res.render("admin/profile", { title: "My Profile" });
});

router.put("/admin/profile", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.admin;	// updateObj: {firstName, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id, updateObj);
		
		const newActivity = new Activity({
			category: "updateAdminProfile",
			admin: req.user._id,
		});
		await newActivity.save();
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/admin/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/emails/reminder", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const currentLoans = await Loan.find({ status: { $in: ["issued", "overdue"] } }).populate("book").populate("user");
		
		const transport = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: "test@gmail.com",
				pass: "test"
			}
		});
		
		for(let i=0; i<currentLoans.length; i++)
		{
			const email = currentLoans[i].user.email;
			const book = currentLoans[i].book.title;
			const dueTime = currentLoans[i].dueTime.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short"});
			
			await transport.sendMail({
				from: `Library <test@gmail.com>`,
				to: email,
				subject: "Book reminder",
				text: "You have to return a book",
				html: `<p>Your book ${book} is due to be returned before ${dueTime}</p>`
			});
			
		}
		
		req.flash("success", "Emails sent successfully");
		res.redirect("/admin/loans/current");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});


module.exports = router;