const { resolve, relative, isAbsolute, basename } = require("path");
const mime = require("mime");
const { check, ValueError } = require("./blork");
const chokidar = require("chokidar");
const md5file = require("md5-file").sync;
const prettyBytes = require("pretty-bytes");
// const anymatch = require("anymatch");
const { globify, slashify, indexify, slugify, objMap } = require("./helpers");
const { match, render, placeholders } = require("hokey-cokey");
const { PREFIX, TEMPLATES, IGNORE, URL, INCLUDE, INDEXES, TYPE } = require("./constants");
const pathinfo = require("./pathinfo");

/**
 * Monitor a directory for files with given include and create Gatsby pages at corresponding paths to those files.
 */
module.exports = function createPagesStatefully(
	{ actions, reporter, createNodeId, store },
	{ path, template, url = URL, include = INCLUDE, ignore = [], indexes = INDEXES, debug = false },
	done
) {
	// Catch all errors.
	try {
		// Check options.
		check(path, "options.path: string+");
		check(template, "options.template: string+");
		check(url, "options.url: string+");
		check(include, "options.include: string-noslashes+ | string-noslashes+[]");
		check(ignore, "options.ignore: string-noslashes+ | string-noslashes+[]");
		check(indexes, "options.indexes: string-noslashes+ | string-noslashes+[]");
		check(debug, "options.debug: boolean");

		// Convert include, ignore, index to array.
		if (typeof include === "string") include = [include];
		if (typeof ignore === "string") ignore = [ignore];
		if (typeof indexes === "string") indexes = [indexes];

		// If URL option has placeholders, the placeholders must also exist in every include glob.
		// (Otherwise we won't be able to render the URL because placeholders will be missing.)
		const urlPlaces = placeholders(url).filter(p => p !== "slug");
		for (let i = 0; i < include.length; i++) {
			const includePlaces = placeholders(include[i]);
			const missingPlaces = urlPlaces.filter(p => !includePlaces.includes(p));
			if (missingPlaces.length) {
				const missing = "{" + missingPlaces.join("}, {") + "}";
				throw new ValueError(
					`options.include: Must include all placeholders from options.url (missing ${missing})`,
					include[i]
				);
			}
		}

		// Resolve path and template.
		const resolvedPath = resolve(path);
		const templatePath = isAbsolute(template)
			? resolve(template)
			: resolve(TEMPLATES, template);

		// Check paths.
		check(resolvedPath, "options.path: fs-dir");
		check(templatePath, "options.template: fs-file");

		// Listen for new component pages to be added or removed.
		chokidar
			.watch("**/*", {
				cwd: resolvedPath,
				ignored: [...IGNORE, ...ignore.map(globify)],
				alwaysStat: true
			})
			.on("add", (file, stats) => {
				try {
					// Included?.
					const fileBase = basename(file);
					const fileParams = match(include, fileBase);
					if (!fileParams) return; // File doesn't match any options.include.

					// Ignored?
					if (match(ignore, fileBase)) return; // File is ignored.

					// Vars.
					const relativePath = file;
					const absolutePath = resolve(resolvedPath, file);
					const rootPath = relative(process.cwd(), absolutePath);
					const isIndex = !!match(indexes, fileBase);
					const info = pathinfo(relativePath); // Generates slug, slugs, etc.
					const extension = info.extension;
					const sluggyParams = objMap(fileParams, slugify);

					// Log.
					if (debug) reporter.log(PREFIX + `chokidar add ${rootPath}`);

					// Tidy the path info if this is an index file (e.g. README.md or index.html)
					if (isIndex) indexify(info);

					// Render final URL (which may include :slug or any placeholders).
					const renderedUrl = render(url, { slug: info.slug, ...sluggyParams });

					// Create node.
					const node = {
						...info,
						id: createNodeId(TYPE + rootPath),
						absolutePath,
						relativePath,
						rootPath,
						templatePath,
						index: isIndex,
						url: slashify(renderedUrl), // Add leading slash.
						size: stats.size,
						prettySize: prettyBytes(stats.size),
						modifiedTime: stats.mtime.toString(),
						accessedTime: stats.atime.toString(),
						changedTime: stats.ctime.toString(),
						birthtime: stats.birthtime.toString(),
						params: fileParams,
						internal: {
							type: TYPE,
							description: `${TYPE}: ${rootPath}`,
							mediaType: mime.getType(extension),
							contentDigest: md5file(absolutePath)
						},
						children: []
					};

					// Duplicate check.
					const nodes = store.getState().nodes;
					for (const [, n] of nodes)
						if (node.internal.type === TYPE && n.url === node.url)
							return reporter.warn(
								PREFIX +
									`Attempted to create two pages with the same path (second page was skipped):
									${n.rootPath}
									${node.rootPath}`
							);

					// Save node.
					actions.createNode(node);
					if (debug) reporter.log(PREFIX + `create node ${node.url}`);

					// Create relationship with parent (based on page URL).
					// e.g. "/a/b/c" adds "/a/b" as its parent (it can't have a parent if depth=0).
					for (const [, n] of nodes)
						if (n.internal.type === TYPE) {
							// Parent: Special case for depth=1 nodes that just checks depth.
							if (node.depth === 1) {
								if (n.depth === 0) {
									actions.createParentChildLink({ parent: n, child: node });
									if (debug) reporter.log(PREFIX + `add parent ${n.url}`);
								}
							}
							// Parent: Match other parents using path indexOf.
							else if (node.depth === n.depth + 1) {
								if (node.url.indexOf(n.url + "/") === 0) {
									actions.createParentChildLink({ parent: n, child: node });
									if (debug) reporter.log(PREFIX + `add parent ${n.url}`);
								}
							}
							// Children: Special case for root node that just uses depth.
							if (node.depth === 0) {
								if (n.depth === 1) {
									actions.createParentChildLink({ parent: node, child: n });
									if (debug) reporter.log(PREFIX + `add child ${n.url}`);
								}
							}
							// Children: Match other parents using path indexOf.
							else if (n.depth === node.depth + 1) {
								if (n.url.indexOf(node.url + "/") === 0) {
									actions.createParentChildLink({ parent: node, child: n });
									if (debug) reporter.log(PREFIX + `add child ${n.url}`);
								}
							}
						}

					// Create page.
					actions.createPage({
						path: node.url,
						component: node.templatePath,
						context: node // Use entire node as context so id, slug, extension, absolutePath can be used for filtering.
					});
					if (debug) reporter.log(PREFIX + `create page ${node.url}`);

					// Associate node with page (DH: not sure if this is needed).
					actions.createPageDependency({ path: node.url, nodeId: node.id });
				} catch (err) {
					// Log and rethrow.
					reporter.panic(PREFIX + err);
					throw err;
				}
			})
			.on("unlink", file => {
				try {
					// Vars.
					const absolute = resolve(resolvedPath, file);
					const rootPath = relative(process.cwd(), absolute);

					// Log.
					if (debug) reporter.log(PREFIX + `chokidar unlink ${rootPath}`);

					// Delete pages in store matching file's full path.
					const nodes = store.getState().nodes;
					for (const [, node] of nodes)
						if (node.internal.type === TYPE && node.absolutePath === absolute) {
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
									if (debug) reporter.log(PREFIX + `delete child from ${n.url}`);
								}

							// Delete node.
							// Do this after so if the child-removes fail we don't have a reference to a dead page.
							actions.deleteNode({ node });
							if (debug) reporter.log(PREFIX + `delete node ${node.url}`);

							// Delete page.
							actions.deletePage({ path: node.url, component: node.templatePath });
							if (debug) reporter.log(PREFIX + `delete page ${node.url}`);
						}
				} catch (err) {
					// Log and rethrow.
					reporter.panic(PREFIX + err);
					throw err;
				}
			})
			.on("ready", done);
	} catch (err) {
		// Log and rethrow.
		reporter.panic(PREFIX + err);
		throw err;
	}
};
