const fs = require("fs");
const { GraphQLString, GraphQLList } = require("gatsby/graphql");
const { TYPE } = require("./constants");

/**
 * Create GraphQL fields for this node.
 * We use this to asyncronously load the 'content' field when it's needed but not before.
 */
module.exports = function setFieldsOnGraphQLNodeType({ type }) {
	// Only work on Templated.
	if (type.name !== TYPE) return {};

	// Return new resolvers.
	return {
		content: {
			type: GraphQLString,
			args: {},
			description: "Get file's entire contents as a string.",
			resolve: node => fs.readFileSync(node.absolutePath, "utf-8")
		},
		// Force arrays.
		// If we don't they might not exist because empty arrays can't be inferred by Gatsby.
		slugs: {
			type: new GraphQLList(GraphQLString),
			args: {},
			resolve: file => file.slugs
		},
		dirs: {
			type: new GraphQLList(GraphQLString),
			args: {},
			resolve: file => file.dirs
		}
	};
};
