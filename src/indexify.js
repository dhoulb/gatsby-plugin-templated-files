/**
 * Make an object returned from pathinfo() into an index.
 * (Basically works as if the index.md was stripped from end of the path).
 *
 * @param {object} info An object returned from pathinfo() — modified by reference and returned.
 * @returns {object} The modified path info object.
 *
 * @internal
 */
module.exports = function indexify(info) {
	info.base = info.name = info.dirs.length ? info.dirs.pop() : "";
	info.dir = info.dirs.join("/");
	info.extension = "";
	info.slugs.pop();
	info.slug = info.slugs.join("/");
	info.depth--;
	return info;
};
