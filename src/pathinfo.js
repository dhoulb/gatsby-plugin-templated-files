const { slugify } = require("./helpers");

/**
 * Turn a file name like `contact/directions.md` into an equivalent URL slug like `contact/directions`
 * Generate some other fields at the same time.
 *
 * - Files named `index` or `readme` are used as indexes (case insensitive), e.g. `dir/index.md` and `dir/README.html` return "dir"
 * - All other files the filename is used for the final URL dir, e.g. `dir/My File.md` returns "dir/my-file"
 *
 * @param {string} file The string path to the file, e.g. `a/b/c/MyFile is Amazing.html`
 * @returns {object} Object describing the path that was passed in with index, name, base, ext, dir, dirs, slug, slugs props.
 */
module.exports = function pathinfo(path) {
	// Check.
	if (typeof path !== "string")
		throw new TypeError(`pathinfo(): File path must be string (received ${typeof path})`);

	// Empty path special case.
	if (path === "")
		return {
			base: "",
			name: "",
			extension: "",
			dir: "",
			dirs: [],
			slug: "",
			slugs: [],
			depth: 0
		};

	// Explode by slashes into segments.
	const segs = path.split(/[/\\]/);

	// Error if empty slugs.
	if (segs.includes(""))
		throw new Error(`pathinfo(): File path segments cannot be empty (received "${path}")`);

	// Error if relative path.
	if (segs.includes(".") || segs.includes(".."))
		throw new Error(`pathinfo(): Cannot use relative paths "." or ".." (received "${path}")`);

	// Remove the file name.
	const base = segs.pop();
	const bits = base.split(".");
	const extension = bits.length > 1 ? bits.pop() : "";
	const name = bits.join(".");
	segs.push(name);

	// Fix each part of the string.
	const slugs = segs.map(slugify);

	// Return.
	return {
		base: base,
		name: name,
		extension: extension,
		dir: segs.slice(0, -1).join("/"),
		dirs: segs.slice(0, -1),
		slug: slugs.join("/"),
		slugs: slugs,
		depth: slugs.length
	};
};
