module.exports = {
	siteMetadata: {
		title: "e2e testing fake Gatsby site"
	},
	plugins: [
		{
			resolve: require.resolve("../../"), // Resolve to our copy of gatsby-plugin-templated-files
			options: {
				path: "pages",
				template: "Page.jsx",
				url: "/pages/:slug",
				include: ["*.md", "/child3.txt"],
				ignore: ["IGNORE.md", "child2/ALSOIGNORE.md"],
				indexes: ["index.*", "child2/LIST.md"],
				debug: true
			}
		}
	]
};
