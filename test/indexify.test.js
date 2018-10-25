const indexify = require("../src/indexify");

// Tests.
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
