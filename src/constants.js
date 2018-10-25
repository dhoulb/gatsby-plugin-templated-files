exports.TYPE = "Templated";
exports.URL = "/:slug";
exports.INCLUDE = ["**/*.md"];
exports.IGNORE = [
	"**/*.un~",
	"**/.DS_Store",
	"**/.gitignore",
	"**/.npmignore",
	"**/.babelrc",
	"**/yarn.lock",
	"**/bower_components",
	"**/node_modules",
	"../**/dist/**"
];
exports.INDEXES = ["**/index.*", "**/README.*"];
exports.TEMPLATES = "src/templates";
