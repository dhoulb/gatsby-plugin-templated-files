module.exports = {
	siteMetadata: {
		title: "e2e testing fake Gatsby site"
	},
	plugins: [
		{
			resolve: require.resolve("../"), // Resolve to our copy of gatsby-plugin-templated-files
			options: {
				path: "pages",
				template: "Page.jsx",
				url: "/pages/:slug",
				include: ["*.md", "child3.txt"],
				ignore: ["IGNORE.md", "ALSOIGNORE.md"],
				indexes: ["index.*", "LIST.md"],
				debug: true
			}
		},
		{
			resolve: require.resolve("../"), // Resolve to our copy of gatsby-plugin-templated-files
			options: {
				path: `${__dirname}/blog`,
				template: `${__dirname}/src/blog-templates/Blog.jsx`,
				url: "/blog/{year}/{month}/{day}/{title}",
				include: "{year}-{month}-{day} - {title}.md",
				exclude: "EXCLUDE.md",
				indexes: "README.md",
				debug: true
			}
		}
	]
};
