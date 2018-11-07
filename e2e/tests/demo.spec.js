describe("demo", () => {
	it("Visits /pages/ and checks content", () => {
		cy.visit("/pages/");
		cy.get("pre").contains(
			'{"rootPath":"pages/index.md","relativePath":"index.md","depth":0,"slug":"","content":"The contents of INDEX"}'
		);
	});
	it("Visits /pages/child1 and checks content", () => {
		cy.visit("/pages/child1");
		cy.get("pre").contains(
			'{"rootPath":"pages/child1.md","relativePath":"child1.md","depth":1,"slug":"child1","content":"The contents of CHILD1"}'
		);
	});
	it("Visits /pages/child2 and checks content", () => {
		cy.visit("/pages/child2");
		cy.get("pre").contains(
			'{"rootPath":"pages/child2/index.md","relativePath":"child2/index.md","depth":1,"slug":"child2","content":"The contents of CHILD2"}'
		);
	});
	it("Visits /pages/child2/subchild1 and checks content", () => {
		cy.visit("/pages/child2/subchild1");
		cy.get("pre").contains(
			'{"rootPath":"pages/child2/subchild1.md","relativePath":"child2/subchild1.md","depth":2,"slug":"child2/subchild1","content":"The contents of SUBCHILD1"}'
		);
	});
	it("Visits /pages/child2/subchild2 and checks content", () => {
		cy.visit("/pages/child2/subchild2");
		cy.get("pre").contains(
			'{"rootPath":"pages/child2/subchild2.md","relativePath":"child2/subchild2.md","depth":2,"slug":"child2/subchild2","content":"The contents of SUBCHILD2"}'
		);
	});
	it("Visits /pages/child3 and checks content", () => {
		cy.visit("/pages/child3");
		cy.get("pre").contains(
			'{"rootPath":"pages/child3.txt","relativePath":"child3.txt","depth":1,"slug":"child3","content":"The contents of CHILD3"}'
		);
	});
	it("Visits /pages/ignore and checks code", () => {
		cy.visit("/pages/ignore");
		cy.get("h1").contains("Gatsby.js development 404 page");
	});
	it("Visits /pages/dotfile and checks code", () => {
		cy.visit("/pages/dotfile");
		cy.get("h1").contains("Gatsby.js development 404 page");
	});
});
