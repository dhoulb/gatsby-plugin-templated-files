const { globify, slashify, slugify, indexify } = require("../src/helpers");

// Tests.
describe("globify()", () => {
	test("Works correctly", () => {
		expect(globify("index.js")).toBe("**/index.js");
		expect(globify("/index.js")).toBe("/index.js");
		expect(globify("test/index.js")).toBe("test/index.js");
	});
});
describe("slashify()", () => {
	test("Works correctly", () => {
		expect(slashify("index.js")).toBe("/index.js");
	});
});
describe("slugify()", () => {
	test("Works correctly", () => {
		expect(slugify("This Should Be Slugged")).toBe("this-should-be-slugged");
		expect(slugify("--- This Should Be --- Slugged ---")).toBe("this-should-be-slugged");
	});
});
describe("indexify()", () => {
	test("Returns correct fields for an indexed root file", () => {
		expect(
			indexify({
				base: "index.html",
				name: "index",
				extension: "html",
				dir: "",
				dirs: [],
				slug: "index",
				slugs: ["index"],
				depth: 1
			})
		).toEqual({
			base: "",
			name: "",
			extension: "",
			dir: "",
			dirs: [],
			slug: "",
			slugs: [],
			depth: 0
		});
	});
	test("Returns correct fields for an indexed deep file", () => {
		expect(
			indexify({
				base: "index.md",
				name: "index",
				extension: "md",
				dir: "a/b",
				dirs: ["a", "b"],
				slug: "a/b/index",
				slugs: ["a", "b", "index"],
				depth: 3
			})
		).toEqual({
			base: "b",
			name: "b",
			extension: "",
			dir: "a",
			dirs: ["a"],
			slug: "a/b",
			slugs: ["a", "b"],
			depth: 2
		});
	});
});
