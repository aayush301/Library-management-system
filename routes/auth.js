const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const passport = require("passport");
const middleware = require("../middleware/index.js")


router.get("/auth/admin-signup", middleware.ensureNotLoggedIn, (req,res) => {
	res.render("auth/adminSignup", {
		title: "Admin Signup"
	});
});

router.post("/auth/admin-signup", middleware.ensureNotLoggedIn, async (req,res) => {
	
	const { firstName, lastName, email, password1, password2 } = req.body;
	let errors = [];
	
	if (!firstName || !lastName || !email || !password1 || !password2) {
		errors.push({ msg: "Please fill in all the fields" });
	}
	if (password1 != password2) {
		errors.push({ msg: "Passwords are not matching" });
	}
	if (password1.length < 4) {
		errors.push({ msg: "Password length should be atleast 4 characters" });
	}
	if(errors.length > 0) {
		return res.render("auth/adminSignup", {
			title: "Admin signup",
			errors, firstName, lastName, email, password1, password2
		});
	}
	
	try
	{
		const user = await User.findOne({ email: email });
		if(user)
		{
			errors.push({msg: "This Email is already registered. Please try another email."});
			return res.render("auth/adminSignUp", {
				title: "Admin signup",
				firstName, lastName, errors, email, password1, password2
			});
		}
		
		const newUser = new User({ firstName, lastName, email, password:password1, role:"admin" });
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(newUser.password, salt);
		newUser.password = hash;
		await newUser.save();
		req.flash("success", "You are successfully registered and can log in.");
		res.redirect("/auth/admin-login");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});

router.get("/auth/admin-login", middleware.ensureNotLoggedIn, (req,res) => {
	res.render("auth/adminLogin", {
		title: "Admin login"
	});
});

router.post("/auth/admin-login", middleware.ensureNotLoggedIn, (req,res,next) => {
	passport.authenticate('local-admin', {
		successRedirect: req.session.returnTo || "/admin/dashboard",
		failureRedirect: "/auth/admin-login",
		successFlash: true,
		failureFlash: true
	})(req, res, next);
});

router.get("/auth/admin-logout", middleware.ensureAdminLoggedIn, (req,res) => {
	req.logout();
	req.flash("success", "Logged-out successfully")
	res.redirect("/");
});


router.get("/auth/student-signup", middleware.ensureNotLoggedIn, (req,res) => {
	res.render("auth/studentSignup", {
		title: "Student signup"
	});
});

router.post("/auth/student-signup", middleware.ensureNotLoggedIn, async (req,res) => {
	
	const { firstName, lastName, email, password1, password2 } = req.body;
	let errors = [];
	
	if (!firstName || !lastName || !email || !password1 || !password2) {
		errors.push({ msg: "Please fill in all the fields" });
	}
	if (password1 != password2) {
		errors.push({ msg: "Passwords are not matching" });
	}
	if (password1.length < 4) {
		errors.push({ msg: "Password length should be atleast 4 characters" });
	}
	if(errors.length > 0) {
		return res.render("auth/studentSignup", {
			title: "Student signup",
			firstName, lastName, errors, email, password1, password2
		});
	}
	
	try
	{
		const user = await User.findOne({ email: email });
		if(user)
		{
			errors.push({msg: "This Email is already registered. Please try another email."});
			return res.render("auth/studentSignUp", {
				title: "Student signup",
				firstName, lastName, errors, email, password1, password2
			});
		}
		
		const newUser = new User({ firstName, lastName, email, password:password1, role:"student" });
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(newUser.password, salt);
		newUser.password = hash;
		await newUser.save();
		req.flash("success", "You are successfully registered and can log in.");
		res.redirect("/auth/student-login");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred.")
		res.redirect("back");
	}
	
});

router.get("/auth/student-login", middleware.ensureNotLoggedIn, (req,res) => {
	res.render("auth/studentLogin", {
		title: "Student login"
	});
});

router.post("/auth/student-login", middleware.ensureNotLoggedIn, (req,res,next) => {
	passport.authenticate('local-student', {
		successRedirect: req.session.returnTo || "/student/dashboard",
		failureRedirect: "/auth/student-login",
		successFlash: true,
		failureFlash: true
	})(req, res, next);
});

router.get("/auth/student-logout", middleware.ensureStudentLoggedIn, (req,res) => {
	req.logout();
	req.flash("success", "Logged-out successfully")
	res.redirect("/");
});

module.exports = router;