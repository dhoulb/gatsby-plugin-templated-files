const { existsSync, statSync } = require("fs");
const { check, add, ValueError } = require("blork");

// Blork types.
add(
	"string-noslashes",
	s => typeof s === "string" && !s.includes("\\") && !s.includes("/"),
	"string with no slashes"
);
add(
	"fs-dir",
	s => typeof s === "string" && existsSync(s) && statSync(s).isDirectory(),
	"directory that exists"
);
add(
	"fs-file",
	s => typeof s === "string" && existsSync(s) && statSync(s).isFile(),
	"file that exists"
);

// Exports.
module.exports = { check, ValueError };
