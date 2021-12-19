const middleware = {
	ensureLoggedIn: (req, res, next) => {
		if(req.isAuthenticated()) {
			return next();
		}
		req.flash("warning", "Please log in first to continue");
		res.redirect("/auth/student-login");
	},
	
	ensureAdminLoggedIn: (req, res, next) => {
		if(req.isUnauthenticated()) {
			req.session.returnTo = req.originalUrl;
			req.flash("warning", "Please log in first to continue");
			return res.redirect("/auth/admin-login");
		}
		if(req.user.role != "admin") {
			req.flash("warning", "This route is allowed for admin only!!");
			return res.redirect("/");
		}
		next();
	},
	
	ensureStudentLoggedIn: (req, res, next) => {
		if(req.isUnauthenticated()) {
			req.session.returnTo = req.originalUrl;
			req.flash("warning", "Please log in first to continue");
			return res.redirect("/auth/student-login");
		}
		if(req.user.role != "student") {
			req.flash("warning", "This route is allowed for student only!!");
			return res.redirect("/");
		}
		next();
	},
	
	ensureNotLoggedIn: (req, res, next) => {
		if(req.isAuthenticated()) {
			req.flash("warning", "Please logout first to continue");
			if(req.user.role == "admin")
				return res.redirect("/admin/dashboard");
			if(req.user.role == "student")
				return res.redirect("/student/dashboard");
		}
		next();
	}
	
}

module.exports = middleware;