#!/usr/bin/env node
const fs   = require('fs')
const path = require('path')
const glob = require("glob")
const yaml = require('js-yaml')
const fm   = require("./modules/frontmatter.js")

var siteOptions = {
	"source": null,
	"destination": "_site",
	"jekyll-bliss": {
		"build-folder": "_build",
		"delete-build-folder": true,
		"skip-jekyll": false,
		"debug": false,
		"livereload": false,
		"watch": false
	}
}
var plugins = []   // Array of plugin classes
var pluginMap = {} // Map of plugins mapped to their desired extensions

try {
	var loaded_config = yaml.safeLoad(fs.readFileSync('_config.yml', 'utf8'));
	var jekyll_bliss_bkup = siteOptions['jekyll-bliss']
	siteOptions = Object.assign({}, siteOptions, loaded_config)
	siteOptions['jekyll-bliss'] =
		Object.assign({}, siteOptions['jekyll-bliss'], jekyll_bliss_bkup)
} catch (e) {
	console.log("Not using a _config.yml - It doesn't exist");
}

function fatal_error(...args) {
	if (args.length > 0) {
		console.error.apply(null, args)
	}
	process.exit()
}

function idir(dirname) {
	// idir = ignore directory
	// This returns a directory ignore pattern for glob
	return path.join(dirname, "**/*")
}

function ensureDirectoryExistence(filePath) {
	var dirname = path.dirname(filePath);
	if (fs.existsSync(dirname)) {
		return true;
	}
	ensureDirectoryExistence(dirname);
	fs.mkdirSync(dirname);
}

const PluginPrototype = {
	constructor() {
		this.name = "Untitled Plugin"
		this.modules = []
	},
	render(text) {
		console.error("This plugin has not been implemented yet.")
		return null
	},
	fatal_error(...args) {
		fatal_error.apply(null, args)
	},
	userRequire(module) {
		import_path = path.join(process.cwd(), "node_modules", module)
		try {
			return require(import_path)
		} catch(e) {
			console.error("Failed to import module", module+".")
			console.error("Please try 'npm install --save", module+"'")
			console.error("Import Path:", import_path)
			fatal_error()
		}
		return null
	},
}

// Load plugins
// TODO: Load plugins from user's CWD if they have a bliss-plugins folder
glob(path.join(__dirname, "bliss-plugins/*.js"), function (er, files) {
	for (plugin_file of files) {
		try {
			var Plugin = require(plugin_file)
			Object.setPrototypeOf(Plugin.prototype, PluginPrototype);
			var PluginObject = new Plugin()
			var pluginlist_index = plugins.push(PluginObject) - 1
			for (ext of PluginObject.extensions) {
				if (pluginMap[ext]) {
					pluginMap[ext].append(pluginlist_index)
				} else {
					pluginMap[ext] = [pluginlist_index]
				}
			}
		} catch (e) {
			console.error(e)
			fatal_error("Error Loading plugin [", plugin_file, "]")
		}
	}
})

var options = {
	ignore: [
		idir('node_modules/'),
		idir('.git/')
	],
	dot: true,
	nodir: true
}

// Ignore the build folder
var buildfolder = siteOptions['jekyll-bliss']['build-folder']
var searchPattern = "**/*"
if (siteOptions['source']) {
	searchPattern = path.join(
		siteOptions['source'],
		searchPattern
	)
}
options['ignore'].push(idir(buildfolder))

glob(searchPattern, options, function (er, files) {
	// Make build folder if not exist
	if (!fs.existsSync(buildfolder)){
		fs.mkdirSync(buildfolder);
	}

	// The magic loop
	for (file of files) {
		var extension = path.extname(file)
		var pluginMapValue = pluginMap[extension]
		var outputFile = path.join(buildfolder, file)
		if (siteOptions['source']) {
			var source = siteOptions['source']
			var lastChar = source.substr(-1)

			if (lastChar != '/') {
				 source = source + '/'
			}
			outputFile = outputFile.replace(
				source, ""
			)
		}

		console.log("Processing File", file)

		if (pluginMapValue){
			var contents = fs.readFileSync(file, 'utf8') || ''
			for (pluginIndex of pluginMapValue) {
				var pluginObj = plugins[pluginIndex]

				// Compiling the file.
				// If it has front-matter, we process it separately
				if (pluginObj.might_have_frontmatter) {
					var fmObject = fm(contents)

					var frontmatter = fmObject['frontmatter']
					var body        = fmObject['body']
					var compiled    = pluginObj.render(body)
					contents = frontmatter + compiled
				} else {
					contents = pluginObj.render(contents)
				}
				// Output file extension
				if (pluginObj.output_extension){
					outputFile = path.join(buildfolder,
						path.basename(file, extension)+pluginObj.output_extension)
				}
			}
			// Now it is time to move the file to the build directory
			// TODO Remove the src/ folder from pathname
			ensureDirectoryExistence(outputFile)
			fs.writeFileSync(outputFile, contents)
		} else {
			// Plugin does not exist to process file
			// Copy it to build folder instead
			ensureDirectoryExistence(outputFile)
			fs.createReadStream(file).pipe(fs.createWriteStream(outputFile))
		}
	}
})
