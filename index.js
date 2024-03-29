#!/usr/bin/env node

const fs       = require('fs')
const path     = require('path')
const glob     = require("glob")
const yaml     = require('js-yaml')
const fm       = require("./modules/frontmatter.js")
const program  = require('commander')
const mm       = require('micromatch')
const chokidar = require('chokidar')
const process  = require('process')

const PREPROCESSOR_TYPE = 0
const COMPILER_TYPE     = 1
const PRESENTATION_TYPE = 2

// Array of plugin classes
var plugins = []

// Plugins mapped to their desired extensions
// [0], [1], AND [2] correspond with the three consts above.
// This will allow us to easily find the type of plugin we
// need for the task at hand. Need a preprocessor plugin? Ok,
// look in pluginMap[0]. Need a compiler? pluginMap[1]. And
// so on.
var pluginMap = [ {}, {}, {} ]

// Default configuration settings. These will later be
// overwritten by the user's _config.yml if it exists.
var siteOptions = {
    "source": '',
    "destination": "_site",
    "jekyll-bliss": {
        "build-folder": "_build",
        "debug": false,
        "quiet": false,
        "delete-build-folder": true,
        "livereload": true,
		"compiler": "Jekyll"
    }
}

function overrideSettings(userSettings, defaultSettings) {
    var returnObject = userSettings
    if ( Array.isArray( defaultSettings ) ) {
        returnObject = defaultSettings.concat( userSettings )
        return returnObject
    }
    for ( key in defaultSettings ) {
        if ( userSettings[key] == undefined || userSettings[key] == null )
            returnObject[key] = defaultSettings[key]
        else if ( typeof defaultSettings[key] == 'object')
            returnObject[key] = overrideSettings(returnObject[key], defaultSettings[key])
    }
    return returnObject
}

// If config exists, attempt to load it into siteOptions
if (fs.existsSync("_config.yml")) {
    try {
        var loaded_config = yaml.load(fs.readFileSync('_config.yml', 'utf8'));
        siteOptions = overrideSettings(loaded_config, siteOptions)
    } catch (e) {
        fatal_error(e)
    }
}

// General printing function
function print(...args) {
    if (args.length > 0 && !siteOptions['jekyll-bliss']['quiet'])
        console.log.apply(null, args)
}

function debug(...args) {
    if (args.length > 0 && siteOptions['jekyll-bliss']['debug'])
        console.log.apply(null, args)
}

// Function to throw a fatal error and exit
function fatal_error(...args) {
    console.error("FATAL ERROR!")
    if (args.length > 0) {
        console.error.apply(null, args)
    }
    process.exit()
}

// idir = ignore directory
// This returns a directory ignore pattern for glob
function idir(dirname) {
    return path.join(dirname, "**/*")
}

// Generates regex to ignore directories.
// Used with chokidar for ignoring directories
// while watching site.
function idir_regex(dir_array) {
    var dirs = ""
    for (i=0; i < dir_array.length; i++) {
        dirs += dir_array[i]
        if ( i != dir_array.length-1 )
            dirs += "|"
    }
    return new RegExp("^("+dirs+")(\/?.+\/?)?")
}

//
function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    // TODO: Figure out why the heck I used this
    //       recursive piece of code.
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

// A 'skeleton' for plugin classes. Basically the base class
const PluginPrototype = {
    name: "Untitled Plugin",
    type: null,
    modules: {},
    // "Constants"
    PREPROCESSOR: PREPROCESSOR_TYPE,
    COMPILER:     COMPILER_TYPE,
    PRESENTATION: PRESENTATION_TYPE,
    render(text) {
        console.error("This plugin has not been implemented yet.")
        return null
    },
    getOption(key) {
        return siteOptions[key]
    },
    fatal_error(...args) {
        fatal_error.apply(null, args)
    },
    debug(...args) {
        args = ["\n[DEBUG]"].concat(args)
        args.push('\n')
        if ( siteOptions['jekyll-bliss']['debug'] )
            console.log.apply(null, args)
    },
    ensureModuleExists(moduleName) {
        if (!this.modules[moduleName])
            fatal_error(moduleName, "was not properly imported.")
    },
    requireWhenNeeded(module) {
        this.modules[module] = null
    },
    importRequires(module) {
        for (key in this.modules) {
            if (!this.modules[key]) {
                // Attempt to require module. If no success, try user's node_modules folder
                try {
                    this.modules[key] = require(key)
                } catch (e) {
                    import_path = path.join(process.cwd(), "node_modules", key)
                    try {
                        this.modules[key] = require(import_path)
                    } catch(e) {
                        console.error("Failed to import module", key+".")
                        console.error("Please try 'npm install", key, "--save'")
                        fatal_error()
                    }
                }
            }
        }
    },
}

// Load plugins
// TODO: Load plugins from user's working directory if they have a bliss-plugins folder
var plugin_files = glob.sync(path.join(__dirname, "bliss-plugins/*.js"))
for (plugin_file of plugin_files) {
    try {
        var Plugin = require(plugin_file)
        Object.setPrototypeOf(Plugin.prototype, PluginPrototype);
        var PluginObject = new Plugin()
        var pluginlist_index = plugins.push(PluginObject) - 1
        var pluginType = PluginObject.type

        if (pluginType == PREPROCESSOR_TYPE) {
            for (ext of PluginObject.extensions) {
                if (pluginMap[pluginType][ext]) {
                    pluginMap[pluginType][ext].append(pluginlist_index)
                } else {
                    pluginMap[pluginType][ext] = [pluginlist_index]
                }
            }
        } else {
            pluginMap[pluginType][PluginObject.name] = pluginlist_index
        }
    } catch (e) {
        console.error(e)
        fatal_error("Error Loading plugin [", plugin_file, "]")
    }
}


// Options for glob search that happens later when we are compiling the site.
// These options basically say "package.json and these other files should not
// be fed to Jekyll". 'dot' allows for dotfiles and 'nodir' tells glob NOT to
// match directories.
var options = {
    ignore: [
        "package.json",
        "package-lock.json",
        idir('node_modules/'),
        idir('.git/')
    ],
    dot: true,
    nodir: true
}

// Ignore the build folder
var buildfolder = siteOptions['jekyll-bliss']['build-folder']
var destination = siteOptions['destination']
options['ignore'].push(idir(buildfolder))
options['ignore'].push(idir(destination))

// Add source directory
var searchPattern = "**/*"
if (siteOptions['source']) {
    searchPattern = path.join(
        siteOptions['source'],
        searchPattern
    )
}

// Alright, here's where the fun begins. This will prorcess all of your
// important files such as pug and sass and get them ready to be fed to
// Jekyll.
function preprocessSite(files, callback)
{
    print("[Preprocessor]")
    var misc_file_count = 0
    var special_file_count = 0

    // Make build folder if not exist
    if (!fs.existsSync(buildfolder)){
        fs.mkdirSync(buildfolder);
    }

    // Loop over files and preprocess what is needed
    for (file of files) {
        var extension = path.extname(file)
        var outputFile = path.join(buildfolder, file)

        // Tidy the outputFile
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

        // **PREPROCCESOR CODE**
        var pluginMapValue = pluginMap[PREPROCESSOR_TYPE][extension]
        if (pluginMapValue){ // There exists a plugin for this filetype
            if (file[0] == '.') // Skip dotfiles
                continue
            print("Processing", file, "...")
            var contents = fs.readFileSync(file, 'utf8') || ''
            for (pluginIndex of pluginMapValue) {
                var pluginObj = plugins[pluginIndex]
                pluginObj.importRequires() // Import the required node modules

                // Compiling the file.
                // If it has front-matter, we process it separately
                if (pluginObj.might_have_frontmatter) {
                    var fmObject = fm(contents)

                    var frontmatter = fmObject['frontmatter']
                    var body        = fmObject['body']
                    var compiled    = pluginObj.render(body, file)
                    contents = frontmatter + compiled
                } else {
                    contents = pluginObj.render(contents, file)
                }
                // Output file extension
                if (pluginObj.output_extension){
                    var newFileName = file.substr(0, file.lastIndexOf(".")) + pluginObj.output_extension;
                    if ( siteOptions["source"] ) {
                        var sourceDir = siteOptions["source"].substr(0, file.lastIndexOf("/"))
                        newFileName = newFileName.replace(sourceDir, "")
                    }
                    outputFile = path.join(buildfolder, newFileName)
                }
            }
            // Now it is time to move the file to the build directory
            // TODO: Remove the src/ folder from pathname
            ensureDirectoryExistence(outputFile)
            fs.writeFileSync(outputFile, contents)
            debug("Wrote file to", outputFile)
            special_file_count++
        } else { // Plugin does not exist to process filetype
            // Copy it to build folder instead
            ensureDirectoryExistence(outputFile)
            fs.createReadStream(file).pipe(fs.createWriteStream(outputFile))
            misc_file_count++ // Increment the count of misc files processed
        }
    }
    if ( siteOptions["source"] && fs.existsSync("_config.yml") ) {
        fs.createReadStream("_config.yml").pipe(fs.createWriteStream( path.join(buildfolder, "_config.yml") ))
        misc_file_count++;
    }
    print("Done! Copied", misc_file_count, "misc file/s and compiled", special_file_count, "special file/s.\n")
    if (callback) callback()
}

function compileSite(compilerName)
{
    var compilerIndex = pluginMap[COMPILER_TYPE][compilerName]
    if ( compilerIndex == undefined )
        fatal_error("Unknown compiler name:", compilerName)

    var compiler = plugins[compilerIndex]
    if ( compiler == undefined )
        fatal_error("Plugin not indexed:", compilerName)

    // Import the required node modules
    compiler.importRequires()

    // Compile!
    var sourceFolder = siteOptions["jekyll-bliss"]["build-folder"]
    compiler.compile(sourceFolder, siteOptions["destination"], function() {
        refreshPresentationPlugins();
    })
}

function buildSite(compilerName="Jekyll") {
    if (!compilerName)
        compilerName = "Jekyll"
    glob(searchPattern, options, function (er, files) {
        preprocessSite(files, function() {
            print("[Compiler]\nBuilding site with compiler", "'"+compilerName+"'")
            compileSite(compilerName)
        })
    })
}

// ENTRY POINT
// CLI general options

// Setting up presentation plugins
function setupPresentationPlugins() {
    for (i in pluginMap[PRESENTATION_TYPE]) {
        var pluginIndex = pluginMap[PRESENTATION_TYPE][i]
        var plugin = plugins[pluginIndex]
        plugin.importRequires()
        plugin.setup( siteOptions["destination"] )
    }
}

function refreshPresentationPlugins() {
    for (i in pluginMap[PRESENTATION_TYPE]) {
        var pluginIndex = pluginMap[PRESENTATION_TYPE][i]
        var plugin = plugins[pluginIndex]
        plugin.reload()
    }
}

function rebuildSite() {
    buildSite( siteOptions['jekyll-bliss']['compiler'] )
}

function initOptions() {
	var o = program.opts()
	if ( o.debug )
		siteOptions['jekyll-bliss']['debug'] = true
	if ( o.quiet )
		siteOptions['jekyll-bliss']['quiet'] = true
	if ( o.compiler )
		siteOptions['jekyll-bliss']['compiler'] = o.compiler
}

// Take files, preprocess them, and comile them.
program
    .version( require('./package.json').version )
    .option('-c, --compiler [name]', 'Specify a compiler plugin. Default is "Jekyll".')
    .option('-d, --debug', 'Enable debug messages.')
    .option('-q, --quiet', 'Don\'t output anything to the terminal. Will still print debug info (if enabled) and error messages.')

program.command('build')
	.alias('b')
	.description('Build your site.')
	.action(() => {
		initOptions()
		rebuildSite()
	})

program.command('serve')
	.alias('s')
	.description('Builds & watches your site, creates server, enables livereload.')
	.action(() => {
		initOptions()
		// Crazy regex to remove dotfiles and build and destination folders.
		var ignorePattern = new RegExp("(((^|[\\/\\\\])\\..)|("+
									   siteOptions["destination"]+"|"+
									   siteOptions["jekyll-bliss"]["build-folder"]+
									   ")(\/?.+)?)")

		var watcher = chokidar.watch('.', {
			ignored: ignorePattern,
			ignoreInitial: true
		})

		watcher.on('all', (event, path) => {
			console.log(event, path);
			rebuildSite()
		});

		rebuildSite()
		if ( siteOptions['jekyll-bliss']['livereload'] )
			setupPresentationPlugins()
	})

program.command('config')
	.description('View configuration used to build site.')
	.action(() => {
		initOptions()
		console.log( yaml.dump(siteOptions) )
	})

program.parse()
