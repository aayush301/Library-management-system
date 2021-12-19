const express = require("express");
const app = express();
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const authRoutes = require("./routes/auth.js");
const studentRoutes = require("./routes/student.js")
const adminRoutes = require("./routes/admin.js")
require("dotenv").config();
require("./config/dbConnection.js")();
require("./config/passport.js")(passport);



app.set("view engine", "ejs");
app.use(expressLayouts);
app.use("/assets", express.static(__dirname + "/assets"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
	secret: "secret",
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(methodOverride("_method"));
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	res.locals.warning = req.flash("warning");
	next();
});



// Routes
app.get("/", (req,res)=>{
	res.render("welcome");
});
app.use(authRoutes);
app.use(studentRoutes);
app.use(adminRoutes);
app.use((req,res) => {
	res.status(404).render("404page");
});


const port = process.env.PORT || 5000;
app.listen(port, console.log(`Server is running at http://localhost:${port}`));
