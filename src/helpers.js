/**
 * Prepend ** and / to a path if it doesn't include any slashes.
 * This is the same as how `.gitignore` files work.
 * @internal
 */
function globify(path) {
	return path.includes("/") ? path : "**/" + path;
}

/**
 * Prepend a leading slash to a URL path if it doesn't have one.
 * @internal
 */
function slashify(path) {
	return path[0] === "/" ? path : "/" + path;
}

/**
 * Turn string into a slug.
 * @internal
 */
function slugify(slug) {
	return slug
		.toLowerCase()
		.replace(/[\s._]+/g, "-") // Change spaces, dots, underscores to hyphens.
		.replace(/[^a-z0-9_-]/g, "") // Remove disallowed characters.
		.replace(/^-+/, "") // Remove leading hyphens.
		.replace(/-+$/, "") // Remove trailing hyphens.
		.replace(/-{2,}/, "-"); // Remove two-in-a-row hyphens.
}

/**
 * Make an object returned from pathinfo() into an index.
 * (Basically works as if the index.md was stripped from end of the path).
 *
 * @param {Object} info An object returned from pathinfo() — modified by reference and returned.
 * @returns {Object} The modified path info object.
 *
 * @internal
 */
function indexify(info) {
	info.name = info.dirs.length ? info.dirs.pop() : "";
	info.base = info.name;
	info.dir = info.dirs.join("/");
	info.extension = "";
	info.slugs.pop();
	info.slug = info.slugs.join("/");
	info.depth--;
	return info;
}

/**
 * Map an object.
 *
 * @param {Object} input The object to be mapped.
 * @param {Function} callback Callback function to apply to each property. Will receive `value` and `key` parameters.
 * @returns {Object} The mapped object.
 */
function objMap(input, callback) {
	const output = {};
	const keys = Object.keys(input);
	for (const key of keys) output[key] = callback(input[key], key);
	return output;
}

// Exports.
module.exports = { globify, slashify, slugify, indexify, objMap };
