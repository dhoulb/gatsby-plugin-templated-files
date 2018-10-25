const fs = require("fs");

/**
 * Loads the content of the file asyncronously.
 */
module.exports = function loadNodeContent(node) {
	// Read file.
	return new Promise((resolve, reject) => {
		fs.readFile(node.absolutePath, "utf-8", (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	});
};
