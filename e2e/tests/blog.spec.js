describe("blog", () => {
	it("Visits blog-article-1 and checks content", () => {
		cy.visit("/blog/2004/12/20/blog-article-1");
		cy.get("pre").contains(
			'{"rootPath":"blog/2004-12-20 - Blog Article 1.md","params":{"year":"2004","month":"12","day":"20","title":"Blog Article 1"},"slug":"2004-12-20-blog-article-1","content":"BLOG 1"}'
		);
	});
	it("Visits blog-article-2 and checks content", () => {
		cy.visit("/blog/2018/12/20/blog-article-2");
		cy.get("pre").contains(
			'{"rootPath":"blog/2018-12-20 - Blog Article 2.md","params":{"year":"2018","month":"12","day":"20","title":"Blog Article 2"},"slug":"2018-12-20-blog-article-2","content":"BLOG 2"}'
		);
	});
});
