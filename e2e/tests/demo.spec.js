describe("demo", () => {
	it("Visits / and checks content", () => {
		cy.visit("/");
		cy.get("pre").contains(
			'{"rootPath":"pages/index.md","relativePath":"index.md","depth":0,"slug":"","content":"The contents of INDEX"}'
		);
	});
	it("Visits /child1 and checks content", () => {
		cy.visit("/child1");
		cy.get("pre").contains(
			'{"rootPath":"pages/child1.md","relativePath":"child1.md","depth":1,"slug":"child1","content":"The contents of CHILD1"}'
		);
	});
	it("Visits /child2 and checks content", () => {
		cy.visit("/child2");
		cy.get("pre").contains(
			'{"rootPath":"pages/child2/index.md","relativePath":"child2/index.md","depth":1,"slug":"child2","content":"The contents of CHILD2"}'
		);
	});
	it("Visits /child2/subchild1 and checks content", () => {
		cy.visit("/child2/subchild1");
		cy.get("pre").contains(
			'{"rootPath":"pages/child2/subchild1.md","relativePath":"child2/subchild1.md","depth":2,"slug":"child2/subchild1","content":"The contents of SUBCHILD1"}'
		);
	});
	it("Visits /child2/subchild2 and checks content", () => {
		cy.visit("/child2/subchild2");
		cy.get("pre").contains(
			'{"rootPath":"pages/child2/subchild2.md","relativePath":"child2/subchild2.md","depth":2,"slug":"child2/subchild2","content":"The contents of SUBCHILD2"}'
		);
	});
});
