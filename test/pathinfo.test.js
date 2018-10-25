const pathinfo = require("../src/pathinfo");

// Tests.
describe("pathinfo()", () => {
	test("Sluggifies correctly", () => {
		expect(pathinfo("")).toEqual({
			base: "",
			name: "",
			extension: "",
			dir: "",
			dirs: [],
			slug: "",
			slugs: [],
			depth: 0
		});
		expect(pathinfo("a")).toEqual({
			base: "a",
			name: "a",
			extension: "",
			dir: "",
			dirs: [],
			slug: "a",
			slugs: ["a"],
			depth: 1
		});
		expect(pathinfo("a/b/c")).toEqual({
			base: "c",
			name: "c",
			extension: "",
			dir: "a/b",
			dirs: ["a", "b"],
			slug: "a/b/c",
			slugs: ["a", "b", "c"],
			depth: 3
		});
		expect(pathinfo("a/b/My Dir/My File.js")).toEqual({
			base: "My File.js",
			name: "My File",
			extension: "js",
			dir: "a/b/My Dir",
			dirs: ["a", "b", "My Dir"],
			slug: "a/b/my-dir/my-file",
			slugs: ["a", "b", "my-dir", "my-file"],
			depth: 4
		});
	});
	test("Punctuation is stripped or converted correctly", () => {
		expect(pathinfo("a/b/  My Dir !!!??  /My File!!!??.js")).toEqual({
			base: "My File!!!??.js",
			name: "My File!!!??",
			extension: "js",
			dir: "a/b/  My Dir !!!??  ",
			dirs: ["a", "b", "  My Dir !!!??  "],
			slug: "a/b/my-dir/my-file",
			slugs: ["a", "b", "my-dir", "my-file"],
			depth: 4
		});
		expect(pathinfo("a/b/.__c_two.md/__My_Other_File__.test.js")).toEqual({
			base: "__My_Other_File__.test.js",
			name: "__My_Other_File__.test",
			extension: "js",
			dir: "a/b/.__c_two.md",
			dirs: ["a", "b", ".__c_two.md"],
			slug: "a/b/c-two-md/my-other-file-test",
			slugs: ["a", "b", "c-two-md", "my-other-file-test"],
			depth: 4
		});
	});
	test("Throw if input is not string", () => {
		expect(() => pathinfo()).toThrow(Error);
		expect(() => pathinfo()).toThrow("File path must be string");
	});
	test("Throw if input path has empty segments", () => {
		expect(() => pathinfo("a/b//c/d")).toThrow(Error);
		expect(() => pathinfo("a/b//c/d")).toThrow("File path segments cannot be empty");
	});
	test("Throw if input path parts are relative paths", () => {
		expect(() => pathinfo("a/./a")).toThrow(Error);
		expect(() => pathinfo("a/./a")).toThrow('Cannot use relative paths "." or ".."');
		expect(() => pathinfo("a/../a")).toThrow(Error);
		expect(() => pathinfo("a/../a")).toThrow('Cannot use relative paths "." or ".."');
	});
});
