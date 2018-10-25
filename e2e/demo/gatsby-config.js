module.exports = {
	siteMetadata: {
		title: "e2e testing fake Gatsby site"
	},
	plugins: [
		{
			resolve: require.resolve("../../"), // Resolve to our copy of gatsby-plugin-templated-files
			options: {
				path: "pages",
				template: "Page.jsx"
			}
		}
	]
};
