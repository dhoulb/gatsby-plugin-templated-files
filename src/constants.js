exports.TYPE = "Templated";
exports.URL = "/:slug";
exports.INCLUDE = ["**/*.md", "**/*.markdown"];
exports.IGNORE = [
	"**/.*",
	"**/yarn.lock",
	"**/package.json",
	"**/package-lock.json",
	"**/node_modules"
];
exports.INDEXES = ["**/index.*", "**/README.*"];
exports.TEMPLATES = "src/templates";
