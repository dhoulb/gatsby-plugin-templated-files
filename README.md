# gatsby-plugin-templated-files

[![Travis-CI](https://img.shields.io/travis/dhoulb/gatsby-plugin-templated-files.svg?style=flat)](https://travis-ci.com/dhoulb/gatsby-plugin-templated-files)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat)](https://github.com/semantic-release/semantic-release)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)
[![npm](https://img.shields.io/npm/dm/gatsby-plugin-templated-files.svg)](https://www.npmjs.com/package/gatsby-plugin-templated-files)

Allows directories of files to be turned into pages in GatsbyJS (v2) via a React template component. Effectively works like [`gatsby-plugin-page-creator`](https://www.gatsbyjs.org/packages/gatsby-plugin-page-creator/) but for files of any type.

The primary use for this will be to crawl a directory of Markdown files and turn them into pages matching that folder heirarchy _but without_ adding boilerplate page-creation code in `gatsby-node.js` file _and without_ needing any [`gatsby-source-filesystem`](https://www.gatsbyjs.org/packages/gatsby-source-filesystem/) configuration.

You _do_ still need the [`gatsby-transformer-remark`](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/) plugin to parse your files into Markdown. The example below shows a template using these two plugins together.

## Install

```sh
npm install gatsby-plugin-templated-files
```

## How to use

Configure in your `gatsby-config.js` file. Multiple instances can be included to crawl different paths or use different templates:

```js
// gatsby-config.js
module.exports = {
  plugins: {
    {
      resolve: "gatsby-plugin-templated-files",
      options: {
        path: "pages",
        template: "Page.jsx",
      },
    },
    {
      resolve: "gatsby-plugin-templated-files",
      options: {
        path: "./pastas",
        template: "Pasta.jsx",
        url: "/pasta/:slug",
      },
    },
    {
      resolve: "gatsby-plugin-templated-files",
      options: {
        // Crawl the ./blog/ directory
        path: "blog",
        // Use this template file (relative to src/templates or absolute)
        template: `${__dirname}/src/othertemplates/Blog.jsx`,
        // Set a format for the URL (defaults to "/:slug")
        url: "/blog/{year}/{month}/{day}/{ref}",
        // File globs to include (defaults to *.md and *.markdown)
        include: [
          "{year}-{month}-{day}-{ref}.txt",
          "{year}-{month}-{day}-{ref}.md",
          "{year}-{month}-{day}-{ref}.html",
        ]
        // File globs to ignore
        ignore: [
          "LICENSE.txt",
          "LICENSE.md",
        ], 
        // File globs to use as directory indexes (defaults to index.* and README.*)
        indexes: [
          "README.md",
          "sitepage.html",
          "index.*",
        ]
      },
    },
    "gatsby-plugin-remark"
  }
}
```

## Options

### `options.path` (required)
String path to directory of files to create corresponding pages for, e.g. `src/blog/`

- Paths are relative to the site root CWD (where your `gatsby-config.js` is!)

### `options.template` (required)
String path to the `*.js` or `*.jsx` template file the pages should use, e.g. `Blog.jsx`

- Templates are (by convention) stored in the `src/templates` directory
- Relative paths are relative to the `src/templates`, e.g. `MyTemplate.jsx`
- Use absolute paths to point to other directories, e.g. `${__dirname}/src/other/MyOtherTemplate.js`

### `options.url` (optional)
Set the output URL format for pages. Defaults to `/:slug`

- Use to append trailing slashes e.g. `/:slug/`
- Use to prepend directories e.g. `/blog/:slug`
- Leading slash is recommended but not required
- `:slug` parameter is always available
- Parameters created in `options.include` can also be used (e.g. `:year`, see below)
- Parameters can be in `:express`, `{jsx}`, `${es6}`, or `{{handlebars}}` format
- Parameter values are 'sluggified', i.e. `My Page` becomes `my-page`

### `options.include` (optional)
String file glob (or array of globs) to include when crawling the `options.path` dir. If specified will replace the default list:

```
*.md
*.markdown
```

`options.include` can include _parameters_ in `:express`, `{jsx}`, `${es6}`, and `{{handlebars}}` formats in order to extract additional information from the filename. These work like `*` wildcard matching _but_ are available for querying in the GraphQL node (as `params`).

For example if `options.include` was set to `":year-:month-:day - :title.md"` then files matching the glob `*-*-* - *.md` will be included, and the matched parameters can be used in GraphQL queries:

```graphql
query($year: String!) {
  templated(params { year: { eq: $year } }) { 
    params { 
      year
      month
      day
      title
    }
  }
}
```

### `options.ignore` (optional)
String file glob (or array of globs) to ignore when crawling. If specified will _add to_ the default list (dotfiles and npm files):

```
.*
yarn.lock
package.json
package-lock.json
node_modules
```

### `options.indexes`
String file glob (or array of globs) to use as index files, e.g. if `listing.md` is an index then `a/b/c/listing.md` will have the `a/b/c` slug (with no `listing`). Defaults to:

```
index.*
README.*
```

### _Note:_ glob patterns
`options.include`, `options.ignore`, and `options.indexes` can include `*` as a wildcard. They do not support other features of glob or RegExp and cannot include directories (only filename patterns like `*.md` and `README.*`).

### _Note:_ example configuration
[A full example configuration](https://github.com/dhoulb/gatsby-plugin-templated-files/tree/master/demo) is available to show an example of a basic heirarchical setup, and a setup using file format parameters to construct URLs (year/month/day etc). End-to-end tests are run against this demo so it should be correct!

## Templates

To output your Markdown as HTML (via React) you'll need to create a template file. These files are just normal GatsbyJS page components which have two requirements:

- `default export` a React component
- export a GraphQL query as `query`

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

This GraphQL query retrieves a single `Templated` file node. **All** fields in the node (like `name`, `extension`, `size`, `dir`, `depth`) can be used for filtering and sorting, except for `content` which is lazy-loaded.

```graphql
query($id: String!) {
  templated(id: { eq: $id }) {
    id               # 'b82587df-f952-5201-85c5-bcb9df3a17ca'
    absolutePath     # '/usr/var/www/pastas/Ribbon Pasta/Tagliatelli.md'
    relativePath     # 'Ribbon Pasta/Tagliatelli.md'
    rootPath         # 'pastas/Ribbon Pasta/Tagliatelli.md'
    templatePath     # '/usr/var/www/src/templates/Pasta.jsx'
    index            # false (would be true for e.g. index.md)
    base             # 'Tagliatelli.md'
    name             # 'Tagliatelli'
    extension        # 'md'
    dir              # 'Ribbon Pasta'
    dirs             # ['Ribbon Pasta']
    slug             # 'ribbon-pasta/tagliatelli'
    slugs            # ['ribbon-pasta', 'tagliatelli']
    depth            # 2
    url              # '/pasta/ribbon-pasta/tagliatelli'
    size             # 1048576
    prettySize       # '1 MB'
    modifiedTime     # 'Mon Oct 22 2018 01:01:33 GMT'
    accessedTime     # 'Mon Oct 22 2018 01:01:33 GMT'
    changedTime      # 'Mon Oct 22 2018 01:01:33 GMT'
    birthtime        # 'Mon Oct 22 2018 01:01:33 GMT'
    content          # '...entire raw contents of Tagliatelli.md...'
    params {}        # { ...any params extracted from options.include pattern }
    internal {
      type           # 'Templated'
      mediaType      # 'text/markdown'
      contentDigest  # '2b365824e5c9240509bc33ec15b05070'
    }
  }
}
```

If you're using [`gatsby-transformer-remark`](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/) it's recommended to query the `Templated` file node first, then add in the child `MarkdownRemark` node using `childMarkdownRemark`:

```graphql
query($path: String!) {
  templated(rootPath: { eq: $path }) {
    absolutePath  # '/usr/var/www/pastas/Ribbon Pasta/Tagliatelli.md'
    rootPath      # 'pastas/Ribbon Pasta/Tagliatelli.md'
    name          # 'Tagliatelli'
    dirs          # ['Ribbon Pasta']
    childMarkdownRemark { 
      html        # '...parsed Markdown content of Tagliatelli.md...'
      frontmatter {
        title     # '...title parsed from frontmatter of Tagliatelli.md...'
      }
    }
  }
}
```

Query for a list of files with an `allTemplated` query. Results can again be filtered and sorted using any of the `Templated` node's fields.

```graphql
{
  allTemplated(filter: { name: { eq: "abc" } }, sort: { fields: [rootPath], order: DESC }) {
    edges {
      node {
        base          # 'Tagliatelli.md'
        extension     # 'md'
        dir           # 'Ribbon Pasta'
        modifiedTime  # 'Mon Oct 22 2018 01:01:33 GMT'
      }
    }
  }
}
```

Query heirarchically nested children of the matched file with the following query. You can use this to output your entire tree of files (up to a required depth) e.g. to build navigation menus or sidebars. _You could make this neater with a fragment but we've made it explicit for the example._

Heirarchy in this plugin constructs based on the final page URL (i.e. based on your `options.url` setting). So pages at `/a/x` and `/a/y` become children of the page at `/a`). 

_If you're receiving an error that `childrenTemplated` does not exist, use `childTemplated` instead. Gatsby creates these automatically based on whether **any** `Templated` nodes in your project have multiple children. This is annoying but there's no easy workaround._

```graphql
{
  allTemplated(filter: { depth: { eq: 0 } }) {
    edges {
      node {
        depth         # 0
        name          # ''
        dirs          # []
        relativePath  # 'index.md'
        childMarkdownRemark {
          frontmatter {
            title     # 'Pasta Database'
          }
        }
        childrenTemplated {
          depth         # 1
          name          # 'Ribbon Pasta'
          dirs          # []
          relativePath  # 'Ribbon Pasta/index.md'
          childMarkdownRemark {
            frontmatter {
              title     # 'Ribbon Pasta'
            }
          }
          childrenTemplated {
            depth         # 2
            name          # 'Tagliatelli'
            dirs          # ['Ribbon Pasta']
            relativePath  # 'Ribbon Pasta/Tagliatelli.md'
            childMarkdownRemark {
              frontmatter {
                title     # 'Tagliatelli'
              }
            }
          }
        }
      }
    }
  }
}
```

## Contributing

Useful PRs are welcomed! Code must pass [ESLint](https://eslint.org/) (with [Prettier](https://prettier.io/) via [eslint-prettier](https://prettier.io/docs/en/eslint.html]), [Jest](https://jestjs.io/) unit tests, and [Cypress](https://www.cypress.io/) end-to-end tests. Run this locally with `yarn test` and wait for it to be confirmed by [TravisCI](https://travis-ci.org/).

All commits on the master branch are deployed automatically using [semantic-release](https://github.com/semantic-release/semantic-release) which bumps version numbers automatically based on commit messages, so Commits must follow [Conventional Commits](https://www.conventionalcommits.org/). This is enforced by a [Husky](https://github.com/typicode/husky) precommit hook.

## Changelog

See [Releases](https://github.com/dhoulb/gatsby-plugin-templated-files/releases)