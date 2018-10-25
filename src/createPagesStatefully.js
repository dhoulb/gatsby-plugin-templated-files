const chokidar = require("chokidar");
const fs = require("fs");
const md5file = require("md5-file").sync;
const mime = require("mime");
const path = require("path");
const prettyBytes = require("pretty-bytes");
const anymatch = require("anymatch");
const { TEMPLATES, IGNORE, URL, INCLUDE, INDEXES, TYPE } = require("./constants");
const pathinfo = require("./pathinfo");
const indexify = require("./indexify");

// Constants.
const RP = "gatsby-plugin-templated-files:"; // Reporting prefix.

/**
 * Monitor a directory for files with given include and create Gatsby pages at corresponding paths to those files.
 */
module.exports = function createPagesStatefully(
	{ actions, reporter, createNodeId, store },
	{
		path: pathOption,
		template: templateOption,
		url: urlOption = URL,
		include = INCLUDE,
		ignore = [],
		indexes = INDEXES,
		debug = false
	},
	done
) {
	// Validate options.
	if (!pathOption) reporter.panic(`${RP} options.path is required`);
	if (typeof pathOption !== "string") reporter.panic(`${RP} options.path must be string`);
	if (!templateOption) reporter.panic(`${RP} options.template is required`);
	if (typeof templateOption !== "string") reporter.panic(`${RP} options.template is required`);
	if (typeof urlOption !== "string") reporter.panic(`${RP} options.url must be string`);
	if (!(include instanceof Array)) reporter.panic(`${RP} options.path is required`);
	for (let i = 0; i < include.length; i++)
		if (typeof include[i] !== "string")
			reporter.panic(`${RP} options.include must be array of strings`);
	if (!(ignore instanceof Array)) reporter.panic(`${RP} options.ignore must be array of strings`);
	for (let i = 0; i < ignore.length; i++)
		if (typeof ignore[i] !== "string")
			reporter.panic(`${RP} options.ignore must be array of strings`);
	if (!(indexes instanceof Array))
		reporter.panic(`${RP} options.indexes must be array of strings`);
	for (let i = 0; i < indexes.length; i++)
		if (typeof indexes[i] !== "string")
			reporter.panic(`${RP} options.indexes must be array of strings`);

	// Resolve path and template.
	const resolvedPath = path.resolve(pathOption);
	const resolvedTemplate = path.isAbsolute(templateOption)
		? path.resolve(templateOption)
		: path.resolve(TEMPLATES, templateOption);

	// Validate that path and template exist.
	if (!fs.existsSync(resolvedPath))
		reporter.panic(`${RP} options.path: Path directory does not exist: ${resolvedPath}`);
	if (!fs.statSync(resolvedPath).isDirectory())
		reporter.panic(`${RP} options.path: Path directory must be a directory: ${resolvedPath}`);
	if (!fs.existsSync(resolvedTemplate))
		reporter.panic(`${RP} options.template: Template file does not exist: ${resolvedTemplate}`);
	if (!fs.statSync(resolvedTemplate).isFile())
		reporter.panic(`${RP} options.template: Template file must be a file: ${resolvedTemplate}`);

	// Make sure URL has leading slash.
	const templateURL = urlOption[0] !== "/" ? `/${urlOption}` : urlOption;

	// Create array of globs for wanted files.
	const globs = include.map(x => path.join(resolvedPath, x));

	// Listen for new component pages to be added or removed.
	chokidar
		.watch(globs, { ignore: [...IGNORE, ...ignore], alwaysStat: true })
		.on("add", (file, stats) => {
			try {
				// Log.
				if (debug) reporter.log(`${RP} chokidar add ${file}`);

				// Vars.
				const nodes = store.getState().nodes;
				const relative = path.relative(resolvedPath, file);
				const rootPath = path.relative(process.cwd(), file);
				const index = anymatch(indexes, file);
				const info = pathinfo(relative);
				const extension = info.extension;

				// Tidy the path info if this is an index file (e.g. README.md or index.html)
				if (index) indexify(info);

				// Create node.
				const node = {
					...info,
					id: createNodeId(TYPE + rootPath),
					absolutePath: file,
					relativePath: relative,
					rootPath: rootPath,
					templatePath: resolvedTemplate,
					index: index,
					url: templateURL.replace(":slug", info.slug),
					size: stats.size,
					prettySize: prettyBytes(stats.size),
					modifiedTime: stats.mtime.toString(),
					accessedTime: stats.atime.toString(),
					changedTime: stats.ctime.toString(),
					birthtime: stats.birthtime.toString(),
					internal: {
						type: TYPE,
						description: `${TYPE}: ${rootPath}`,
						mediaType: mime.getType(extension),
						contentDigest: md5file(file)
					},
					children: []
				};

				// Duplicate check.
				for (const [, n] of nodes)
					if (node.internal.type === TYPE && n.url === node.url)
						return reporter.warn(
							`${RP} Attempted to create two pages with the same path (second page was skipped): 
							${n.rootPath}
							${node.rootPath}`
						);

				// Save node.
				actions.createNode(node);
				if (debug) reporter.log(`${RP} create node ${node.url}`);

				// Create relationship with parent (based on page URL).
				// e.g. "/a/b/c" adds "/a/b" as its parent (it can't have a parent if depth=0).
				for (const [, n] of nodes)
					if (n.internal.type === TYPE) {
						// Parent: Special case for depth=1 nodes that just checks depth.
						if (node.depth === 1) {
							if (n.depth === 0) {
								actions.createParentChildLink({ parent: n, child: node });
								if (debug) reporter.log(`${RP} add parent ${n.url}`);
							}
						}
						// Parent: Match other parents using path indexOf.
						else if (node.depth === n.depth + 1) {
							if (node.url.indexOf(n.url + "/") === 0) {
								actions.createParentChildLink({ parent: n, child: node });
								if (debug) reporter.log(`${RP} add parent ${n.url}`);
							}
						}
						// Children: Special case for root node that just uses depth.
						if (node.depth === 0) {
							if (n.depth === 1) {
								actions.createParentChildLink({ parent: node, child: n });
								if (debug) reporter.log(`${RP} add child ${n.url}`);
							}
						}
						// Children: Match other parents using path indexOf.
						else if (n.depth === node.depth + 1) {
							if (n.url.indexOf(node.url + "/") === 0) {
								actions.createParentChildLink({ parent: node, child: n });
								if (debug) reporter.log(`${RP} add child ${n.url}`);
							}
						}
					}

				// Create page.
				actions.createPage({
					path: node.url,
					component: node.templatePath,
					context: node // Use entire node as context so id, slug, extension, absolutePath can be used for filtering.
				});
				if (debug) reporter.log(`${RP} create page ${node.url}`);

				// Associate node with page (DH: not sure if this is needed).
				actions.createPageDependency({ path: node.url, nodeId: node.id });
			} catch (err) {
				// Log and rethrow.
				reporter.panic(err);
				throw err;
			}
		})
		.on("unlink", file => {
			try {
				// Log.
				if (debug) reporter.log(`${RP} chokidar unlink ${file}`);

				// Delete pages in store matching file's full path.
				const nodes = store.getState().nodes;
				for (const [, node] of nodes)
					if (node.internal.type === TYPE && node.absolutePath === file) {
						// Unset the children list first.
						// Otherwise deleteNode() will recursively delete childnodes, which we don't want here — we just want to detach them.
						node.children = [];

						// If any nodes reference this node in their children, delete that reference.
						// You'd expect deleteNode() to do this itself but it doesn't.
						// You'd also hope there was a deleteParentChildLink() action but there isn't.
						const ns = store.getState().nodes;
						for (const [, n] of ns)
							if (n.internal.type === TYPE && n.includes(node.id)) {
								// DH: This is a hack — we shouldn't directly modify the contents of redux state.
								// But it works and it's not possible to add a new reducer to the store.
								n.children = n.children.filter(i => i !== node.id);
								actions.touchNode({ nodeId: n.id });
								if (debug) reporter.log(`${RP} delete child from ${n.url}`);
							}

						// Delete node.
						// Do this after so if the child-removes fail we don't have a reference to a dead page.
						actions.deleteNode({ node: node });
						if (debug) reporter.log(`${RP} delete node ${node.url}`);

						// Delete page.
						actions.deletePage({ path: node.url, component: node.templatePath });
						if (debug) reporter.log(`${RP} delete page ${node.url}`);
					}
			} catch (err) {
				// Log and rethrow.
				reporter.panic(err);
				throw err;
			}
		})
		.on("ready", done);
};
