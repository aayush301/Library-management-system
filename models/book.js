const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	ISBN : {
		type: Number,
		required: true
	},
	description: String,
	authors: String,
	category: String,
	copiesOwned: {
		type: Number,
		required: true
	},
	stock: {
		type: Number,
		required: true
	}
});

const Book = mongoose.model("books", bookSchema);
module.exports = Book;
