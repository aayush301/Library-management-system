# Library Management System

A web application which can manage various tasks in library for both admins and students.  
[View Demo](https://library-aayush.herokuapp.com/)

## Table of Contents
* [Features](#features)
* [Technologies used](#technologies-used)
* [npm packages used](#npm-packages-used)
* [Prerequisites](#prerequisites)
* [Installation and setup](#installation-and-setup)
* [Useful Links](#useful-links)
* [Contact](#contact)


## Features
- The system consists of two types of users: admins and students.
- Each user should have an account.
- The application provides signup, login and logout functionalities.
- A book can have multiple copies so that copies of same book can be issued to multiple students.

### Admin
- Admins can view, add, update or delete the books.
- Admins can view all the students who have an account in the system.
- Admins can keep track of all the activities of library.
- Admins can issue book to a student.
- Admins can collect book from a student.
- Admins can view all the current loans.
- Admins can also view the past loans against which the books have been returned.
- Admins can send the email as reminders to the students.
- Admins can update their profile.

### Student
- Students can view all the books in the library.
- students can keep track of all their activities.
- Students can view all the books which they currently possess along with status (overdue or not).
- Students can also view the books which they have already returned.
- Students can update their profile.


## Technologies used
- HTML
- CSS
- Bootstrap
- Javascript
- Node.js
- Express.js
- Mongodb
- ejs

## npm packages used
- express
- ejs
- express-ejs-layouts
- mongoose
- express-session
- bcryptjs
- passport
- passport-local
- connect-flash
- nodemailer
- method-override
- dotenv

## Prerequisites
For running the application:
- Node.js must be installed on the system.
- You should have a MongoDB database.
- You should have a code editor (preferred: VS Code)

## Installation and Setup
1. Download the source code in the desired location on your system.
2. Open the code in your code editor.
3. To install all the dependencies (listed in package.json file) in your project, go to terminal and type the following command and hit enter:
	```sh
	npm install
	```
4. Create a file named ".env" and enter the following credentials:
	```js
	MONGO_URI=your-mongo-uri
	```
5. Go to terminal and type the following command and hit enter:
	```sh
	npm start
	```
6. Open browser and go to url: http://localhost:5000
7. You need to first signup and then login as admin or student to run the application.
8. Admin signup page can't be accessed from the application. However, I have created a hidden route to access the page: `/auth/admin-signup`

## Useful Links
- Demo: https://library-aayush.herokuapp.com/
- Github Repo: https://github.com/aayush301/Library-management-system
- Nodejs download: https://nodejs.org/
- VS Code download: https://code.visualstudio.com/
- Tutorials: https://www.w3schools.com/
- npmjs docs: https://docs.npmjs.com/
- Expressjs docs: https://expressjs.com/
- Bootstrap docs: https://getbootstrap.com/docs/5.1/getting-started/introduction/
- Mongoosejs docs: https://mongoosejs.com/docs/index.html
- Mongodb atlas: https://www.mongodb.com/cloud/atlas/register
- Mongodb docs: https://docs.mongodb.com/manual/introduction/
- Nodemailer docs: https://nodemailer.com/
- Github docs: https://docs.github.com/en/get-started/quickstart/hello-world
- Git cheatsheet: https://education.github.com/git-cheat-sheet-education.pdf
- VS Code keyboard shortcuts: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf

## Contact
- Email: aayush5521186@gmail.com
- Linkedin: https://www.linkedin.com/in/aayush12/
