const createPagesStatefully = require("../src/createPagesStatefully");

// Tests.
describe("createPagesStatefully()", () => {
	// Mocks.
	const state = { nodes: new Set() };
	const actions = {
		createNode: jest.fn(node => state.nodes.add(node.id, node)),
		createParentChildLink: jest.fn(),
		createPage: jest.fn(),
		createPageDependency: jest.fn(),
		touchNode: jest.fn(),
		deleteNode: jest.fn(),
		deletePage: jest.fn()
	};
	const reporter = {
		log: jest.fn(),
		warn: jest.fn(),
		panic: jest.fn()
	};
	const createNodeId = jest.fn();
	const store = {
		getState: () => state
	};

	// Vars.
	const c = { actions, reporter, createNodeId, store };
	const o = {
		path: "demo/pages",
		template: "demo/src/templates/Page.jsx"
	};

	// Clear mocks before tests.
	beforeEach(() => {
		state.nodes = [];
		jest.clearAllMocks();
	});

	// Tests.
	test("TypeError if options are invalid type", () => {
		expect(() => createPagesStatefully(c, { ...o, path: 123 })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, path: 123 })).toThrow("options.path");
		expect(() => createPagesStatefully(c, { ...o, path: "" })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, path: "" })).toThrow("options.path");
		expect(() => createPagesStatefully(c, { ...o, template: 123 })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, template: 123 })).toThrow("options.template");
		expect(() => createPagesStatefully(c, { ...o, template: "" })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, template: "" })).toThrow("options.template");
		expect(() => createPagesStatefully(c, { ...o, url: 123 })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, url: 123 })).toThrow("options.url");
		expect(() => createPagesStatefully(c, { ...o, include: 123 })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, include: 123 })).toThrow("options.include");
		expect(() => createPagesStatefully(c, { ...o, include: [123] })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, include: [123] })).toThrow("options.include");
		expect(() => createPagesStatefully(c, { ...o, include: [""] })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, include: [""] })).toThrow("options.include");
		expect(() => createPagesStatefully(c, { ...o, include: ["a/b"] })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, include: ["a/b"] })).toThrow(
			"options.include"
		);
		expect(() => createPagesStatefully(c, { ...o, ignore: 123 })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, ignore: 123 })).toThrow("options.ignore");
		expect(() => createPagesStatefully(c, { ...o, ignore: [123] })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, ignore: [123] })).toThrow("options.ignore");
		expect(() => createPagesStatefully(c, { ...o, ignore: [""] })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, ignore: [""] })).toThrow("options.ignore");
		expect(() => createPagesStatefully(c, { ...o, ignore: ["a/b"] })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, ignore: ["a/b"] })).toThrow("options.ignore");
		expect(() => createPagesStatefully(c, { ...o, indexes: 123 })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, indexes: 123 })).toThrow("options.indexes");
		expect(() => createPagesStatefully(c, { ...o, indexes: [123] })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, indexes: [123] })).toThrow("options.indexes");
		expect(() => createPagesStatefully(c, { ...o, indexes: [""] })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, indexes: [""] })).toThrow("options.indexes");
		expect(() => createPagesStatefully(c, { ...o, indexes: ["a/b"] })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, indexes: ["a/b"] })).toThrow(
			"options.indexes"
		);
		expect(reporter.panic).toBeCalledTimes(34);
	});
	test("TypeError if options.url lists parameters not specified in options.includes", () => {
		const options1 = { ...o, include: ["{a}-{b}"], url: "{a}-{b}-{c}" };
		expect(() => createPagesStatefully(c, options1)).toThrow(TypeError);
		expect(() => createPagesStatefully(c, options1)).toThrow(
			"options.include: Must include all placeholders from options.url (missing {c})"
		);
		const options2 = { ...o, include: [":a-:b"], url: ":a-:b-:c" };
		expect(() => createPagesStatefully(c, options2)).toThrow(TypeError);
		expect(() => createPagesStatefully(c, options2)).toThrow(
			"options.include: Must include all placeholders from options.url (missing {c})"
		);
		const options3 = { ...o, include: ["{{a}}-{{b}}"], url: "{{a}}-{{b}}-{{c}}" };
		expect(() => createPagesStatefully(c, options3)).toThrow(TypeError);
		expect(() => createPagesStatefully(c, options3)).toThrow(
			"options.include: Must include all placeholders from options.url (missing {c})"
		);
		const options4 = { ...o, include: ["${a}-${b}"], url: "${a}-${b}-${c}" }; // eslint-disable-line no-template-curly-in-string
		expect(() => createPagesStatefully(c, options4)).toThrow(TypeError);
		expect(() => createPagesStatefully(c, options4)).toThrow(
			"options.include: Must include all placeholders from options.url (missing {c})"
		);
	});
	test("TypeError if options.path or options.template does not exist", () => {
		expect(() => createPagesStatefully(c, { ...o, path: "/dev/null" })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, path: "/dev/null" })).toThrow("options.path");
		expect(() => createPagesStatefully(c, { ...o, template: "/dev/null" })).toThrow(TypeError);
		expect(() => createPagesStatefully(c, { ...o, template: "/dev/null" })).toThrow(
			"options.template"
		);
		expect(reporter.panic).toBeCalledTimes(4);
	});
});
