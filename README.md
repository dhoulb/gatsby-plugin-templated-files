# gatsby-plugin-templated-files

Allows directories of static files (primarily Markdown) to be turned into pages in GatsbyJS (v2) utilising a template component in React that can output the source. Works like (`gatsby-plugin-page-creator`)[https://www.gatsbyjs.org/packages/gatsby-plugin-page-creator/] but for files of any type.

The primary use for this plugin is to crawl a directory of Markdown files and turn them into pages _without_ needing to write your own `gatsby-node.js` file (as shown in the Gatsby tutorial), which removes a lot of boilerplate. It also does not require (`gatsby-source-filesystem`)[https://www.gatsbyjs.org/packages/gatsby-source-filesystem/] as it handles crawling the filesystem itself.

To use with Markdown you will still need (`gatsby-transformer-remark`)[https://www.gatsbyjs.org/packages/gatsby-transformer-remark/] (as per a normal Gatsby configuration). Follow the example below to see how to create a component that can query and output the parsed Markdown content.

## Install

```sh
npm install gatsby-plugin-templated-files
```

## How to use

Add the following to your `gatsby-config.js` file (note you can include multiple instances of the plugin to create separate sets of autopages):

```js
// gatsby-config.js
module.exports = {
	plugins: {
		{
			resolve: "gatsby-plugin-templated-files",
			options: {
				path: "./mypages",
				template: "Page.jsx",
			},
		},
		{
			resolve: "gatsby-plugin-templated-files",
			options: {
				// Crawl the ./blog/ directory.
				path: "blog",
				// Use an absolute path to the template file.
				template: `${__dirname}/src/mytemplatedir/Blog.jsx`,
				// Set a format for the URL (defaults to ":slug")
				format: "blog/:slug",
				// Files to include (defaults to .md only).
				include: [
					"**/*.txt",
					"**/*.md",
					"**/*.html",
				]
				// Files to ignore.
				ignore: [
					"**/\.*", // Ignore files starting with a dot.
					"LICENSE.txt", // Ignore LICENSE.txt file.
				], 
				// Files to use as directory indexes (defaults to index.* and README.*)
				indexes: [
					"**/README.md",
					"**/sitepage.html",
					"**/index.*",
				]
			},
		},
		{
			resolve: "gatsby-plugin-templated-files",
			options: {
				path: "./pastas",
				template: "Pasta.jsx",
			},
		},
	}
}
```

## Options

### `options.path` (required)
Path to the directory containing one or more Markdown files, e.g. `path: \`${__dirname}/src/blog/\`` will create corresponding pages for all `*.md` and `*.markdown` files. 

`index.md` files are used as the 'directory' page, e.g. a file called `a/b/index.md` will be used in a page at the URL `mysite.com/a/b/`

### `options.component` (required)
String path to the component file (`*.js` or `*.jsx`) the pages should should use, e.g. `component: \`${__dirname}/src/templates/Blog.jsx\`` will route all requests for these pages to the `Blog.jsx` component. Use `$slug` variable in your exported query to access the specified slug.

### `options.format` (optional)
Set the format of the output URLs that are used for files, e.g. using `format: "blog/:slug"` will create pages with a `/blog/etc` prefix. Use this setting to append trailing slashes if you need them. Defaults to `":slug"`

_Note: `:slug` is the only variable that can be used currently. If you wish to request more please open an issue._

### `options.include` (optional)
Array of file globs to include when sourcing files. These will replace the default list (which is set up for Markdown parsing):

```
**/*.md
**/*.markdown
```

### `options.ignore` (optional)
Array of file globs to ignore when sourcing files. These will be added to the default list:

```
**/*.un~
**/.DS_Store
**/.gitignore
**/.npmignore
**/.babelrc
**/yarn.lock
**/node_modules
../**/dist/**
```

### `options.indexes`
Array of file globs to use as index files, e.g. if `listing.md` is used as an index, then `a/b/c/listing.md` will have its page created at `/a/b/c/` (with no `listing.md`). Effectively index files _become_ the directory. Defaults to: 

```
**/index.*
**/README.*
```

## Templates

Create template files to output your Markdown as HTML via React. These files are like regular page files in GatsbyJS: they default export a React component, and export a GraphQL query as `query`. 

Templates are (by convention) stored in the `src/templates` directory, and relative paths in this plugin are resolved relative to that folder. e.g. `"Page.jsx"` resolves to `src/templates/Page.jsx`. (Use an absolute path to point to a different directory.)

```js
// src/templates/Pasta.jsx
import React from "react";
import { graphql } from "gatsby";

// Component.
export default function Pasta({ data }) {
	const file = data.templated;
	const markdown = file.childMarkdownRemark;
	return (
		<article>
			<p>{file.dirs.join(" / ")}</p>
			<h1>{markdown.frontmatter.title || file.name}</h1>
			<div dangerouslySetInnerHTML={{ __html: markdown.html }} />
		</article>
	);
}

// Query.
export const query = graphql`
	query($id: String!) {
		templated(id: { eq: $id }) {
			absolutePath       # '/usr/var/www/pastas/Ribbon Pasta/Tagliatelli.md'
			relativePath       # 'Ribbon Pasta/Tagliatelli.md'
			name               # 'Tagliatelli'
			dirs               # ['Ribbon Pasta']
			childMarkdownRemark { 
				html           # '...parsed Markdown content of Tagliatelli.md...'
				frontmatter {
					title      # '...title parsed from frontmatter of Tagliatelli.md...'
				}
			}
		}
	}
`;
```

## How to query

The following GraphQL query will retrieves a single templated file node (of the `Templated` type). All fields in the node (like `name`, `extension`, `size`, `dir`, `depth`) can be used for filtering and sorting except for `content` (which is lazy-loaded when used).

```graphql
query($id: String!) {
	templated(id: { eq: $id }) {
		id                   # 'b82587df-f952-5201-85c5-bcb9df3a17ca'
		absolutePath         # '/usr/var/www/pastas/Ribbon Pasta/Tagliatelli.md'
		relativePath         # 'Ribbon Pasta/Tagliatelli.md'
		rootPath             # 'pastas/Ribbon Pasta/Tagliatelli.md'
		templatePath         # '/usr/var/www/src/templates/Pasta.jsx'
		index                # false (would be true for e.g. index.md)
		base                 # 'Tagliatelli.md'
		name                 # 'Tagliatelli'
		extension            # 'md'
		dir                  # 'Ribbon Pasta'
		dirs                 # ['Ribbon Pasta']
		slug                 # 'ribbon-pasta/tagliatelli'
		slugs                # ['ribbon-pasta', 'tagliatelli']
		depth                # 2
		url                  # '/ribbon-pasta/tagliatelli'
		size                 # 1048576
		prettySize           # '1 MB'
		modifiedTime         # 'Mon Oct 22 2018 01:01:33 GMT'
		accessedTime         # 'Mon Oct 22 2018 01:01:33 GMT'
		changedTime          # 'Mon Oct 22 2018 01:01:33 GMT'
		birthtime            # 'Mon Oct 22 2018 01:01:33 GMT'
		content              # '...entire raw contents of Tagliatelli.md...'
		internal {
			type             # 'Templated'
			mediaType        # 'text/markdown'
			contentDigest    # '2b365824e5c9240509bc33ec15b05070'
		}
	}
}
```

Query for a list of files with an `allTemplated` query. Results can again be filtered and sorted using any of the `Templated` node's fields.

```graphql
{
	allTemplated(filter: { name: { eq: "abc" } }, sort: { fields: [name], order: DESC }) {
		edges {
			node {
				base            # 'Tagliatelli.md'
				extension       # 'md'
				dir             # 'Ribbon Pasta'
				modifiedTime    # 'Mon Oct 22 2018 01:01:33 GMT'
			}
		}
	}
}
```

Retrieve deep sub-files of the matched file with the following query (based on final page URL, so pages at `/a/x` and `/a/y` become children of the page at `/a`). You can use this to spit out your entire tree of files to build navigation menus or sidebars.

_If you're receiving an error that `childrenTemplated` does not exist, use `childTemplated` instead. Gatsby creates these automatically based on whether any `Templated` nodes in your project have multiple children._

```graphql
{
	allTemplated(filter: { depth: { eq: 0 } }) {
		edges {
			node {
				depth                   # 0
				name                    # ''
				dirs                    # []
				relativePath            # 'index.md'
				childrenTemplated {
					depth               # 1
					name                # 'Ribbon Pasta'
					dirs                # []
					relativePath        # 'Ribbon Pasta/index.md'
					childrenTemplated {
						depth           # 2
						name            # 'Tagliatelli'
						dirs            # ['Ribbon Pasta']
						relativePath    # 'Ribbon Pasta/Tagliatelli.md'
					}
				}
			}
		}
	}
}
```