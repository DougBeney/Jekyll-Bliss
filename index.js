#!/usr/bin/env node
/* Jekyll-Bliss
 * by Doug Beney
 * https://dougie.io/
 * ---
 *
 * Terminology:
 *   Build Folder: Folder where we move source files and compile assets (Pug, sass, etc) to.
 *   Destination Folder: Where Jekyll builds our site to.
 *   Misc task: The misc Gulp task copies around all of the files that don't need to be specially processed.
 *   Global Excludes: Exclude a folder or file GLOB pattern from ALL tasks.
 *   Misc Excludes: Exclude a folder or file GLOB pattern from the misc task.
 *   DEBUG: DEBUG is a function that console.logs only if DEBUG is enabled by the user
 */
var VERSION = require('./package.json').version
var fs          = require('fs')
var cli         = require('commander')
var gulp        = require('gulp')
var gdebug      = require('gulp-debug')
var cache       = require('gulp-cached')
var watch       = require('gulp-watch')
// var pug         = require('./gulp-pug-custom/index.js')
var pug = require('gulp-pug')
var frontmatter = require('gulp-frontmatter-wrangler')
var path        = require('path')
var yaml        = require('js-yaml')
var exec        = require('child_process').exec
var waitUntil   = require('wait-until')
var browserSync = require('browser-sync').create();

var user_config = {
	"source": "",
	"destination": "_site",
	"jekyll-bliss": {
		"build-folder": "_build",
		"source": ".",
		"debug": false,
		"livereload": false,
		"watch": false
	},
}

var tasks = ["pug", "misc"]
var directory = process.cwd()
var global_excludes = []
var filetype_excludes_from_misc = [
	"!**/*.pug",
]
var jekyll_build_in_progress = false
var allFilesButExcludedPattern = []

function getbuildfolder(){
	return path.join(directory, user_config['jekyll-bliss']['build-folder'])
}

function getpath(arg="") {
	return path.join(directory, arg)
}

function getsourcepath(arg="") {
	return path.join(directory, "src", arg)
}

function getFolderExcludePatterns(folder) {
	return [
		path.join("!**/", folder , '/**/*'),
		path.join("!**/", folder)
	]
}
function getFileExcludePattern(file) {
	return path.join("!**/", file)
}

function DEBUG(string) {
	if (user_config['jekyll-bliss']['debug']) {
		console.log('[DEBUG] %s', string)
	}
}

function allFilesButExcluded() {
	var pattern = [getpath("**/*")]
	//TODO If pattern=array then process it differently
	for (item of filetype_excludes_from_misc) {
		pattern.push(item)
	}
	for (item of global_excludes) {
		pattern.push(item)
	}
	return pattern
}

gulp.task('pug', function() {
	return gulp.src([getpath('**/*.pug'), ...global_excludes])
		.pipe(cache('pug'))
		.pipe(frontmatter.take())
		.pipe(pug())
		.pipe(frontmatter.putBack())
		.pipe(gulp.dest(getbuildfolder()))
		.pipe(gdebug({title: 'Pug Files', showFiles: false}))
})

gulp.task('misc', function() {
	return gulp.src(allFilesButExcludedPattern)
		.pipe(cache('misc'))
		.pipe(gulp.dest(getbuildfolder()))
		.pipe(gdebug({title: 'Misc. Files', showFiles: false}))
})

gulp.task('jekyll', function() {
	waitUntil(250, Infinity, function condition() {
		return ((jekyll_build_in_progress == false) ? true : false);
	}, function done(result) {
		jekyll_build_in_progress = true
		// Build Jekyll
		var dest = path.join(directory, user_config['destination'])
		var cmd_dest = ' --destination '+dest
		var cmd_bundle = (fs.existsSync(getpath('Gemfile'))) ? "bundle exec " : ""
		var cmd = cmd_bundle+'jekyll build'+cmd_dest
		DEBUG('Using this Jekyll build command:\n' + cmd)
		exec(cmd, {
			cwd: getbuildfolder()
		}, function(error, stdout, stderr) {
			console.log(stdout)
			if (user_config['jekyll-bliss']['livereload']) {
				browserSync.reload()
			}
		});
		jekyll_build_in_progress = false
	});
})

function StartAndWatch(pattern_array, task_array_to_run) {
	// gulp.start(task_array_to_run)
	watch(pattern_array, {"ignoreInitial": true}, function(vinyl) {
		gulp.start(task_array_to_run)
		var filename = vinyl.path.replace(directory, '')
		var event_type = vinyl.event
		console.log("%s (%s)", filename, event_type)
	})
	// watched_task.on('change', function(event) {
	//	var the_file = event.path.replace(directory, '')
	//	console.log("%s was %s.", the_file, event.type);
	// });
}

gulp.task('watch', function(){
	StartAndWatch([getpath('**/*.pug')], ['pug'])
	StartAndWatch(allFilesButExcludedPattern, ['misc'])

	//When any files are changed in the build folder, run Jekyll
	StartAndWatch([getbuildfolder()], ['jekyll'])
})

gulp.task('browser-sync', function() {
	if (user_config['jekyll-bliss']['livereload']) {
		DEBUG("Livereload is enabled")
		// Make sure watching is enabled
		// Without watching, livereload is pointless
		user_config['jekyll-bliss']['watch'] = true
		browserSync.init({
			server: {
				baseDir: path.join(directory, user_config['destination'])
			}
		});
	} else {
		DEBUG("Livereload is disabled")
	}
});


///-----CONFIGURING-DEFAULTS-AND-SETTING-EXCLUDES-----///

// Reading from user's _config.yml
var config_path = path.join(directory, '_config.yml')
if (fs.existsSync(config_path)) {
	try {
		var ymlfile = fs.readFileSync(config_path, 'utf8')
		var loaded_config = yaml.safeLoad(ymlfile)
		var jekyll_bliss_backup = user_config['jekyll-bliss']
		if (!loaded_config['jekyll-bliss']) {
			loaded_config['jekyll-bliss'] = {}
		}
		loaded_config['jekyll-bliss'] = Object.assign(
			user_config['jekyll-bliss'],
			loaded_config['jekyll-bliss']
		)
		user_config = Object.assign(user_config, loaded_config)
		if(user_config['jekyll-bliss'] == null) {
			user_config['jekyll-bliss'] = jekyll_bliss_backup
		}
	} catch (e) {
		console.log(e);
	}
} else {
	DEBUG("Not using a _config.yml. Does not exist.")
}

// Excluding the build folder and dest folder from being compiled
var build_folder = user_config['jekyll-bliss']['build-folder']
var dest_folder  = user_config['destination']
filetype_excludes_from_misc.push(...getFolderExcludePatterns(build_folder))
filetype_excludes_from_misc.push(...getFolderExcludePatterns(dest_folder))

// Macros for two functions
var filep = getFileExcludePattern
var foldp = getFolderExcludePatterns
// Exclude pesky files/folders such as node_modules/, package.json, .git/, etc.
filetype_excludes_from_misc.push(...[
	...foldp('.git'),
	filep('package?(-lock).json'), // exclude both package.json and package-lock.json
	filep('.DS_Store'), // Remove annoying DS Store files on Mac OS X
])
global_excludes.push(...[
	...foldp('node_modules') // Putting node_modules under Global because it could include to-be-processed files (ex. Pug include Pug template examples.)
])
var allFilesButExcludedPattern = allFilesButExcluded()

///-----INITIALIZATION-OF-PROGRAM-----///
cli
	.version(VERSION)
	.on('--help', function(){
		console.log('\n  Commands:')
		console.log('')
		console.log('    build          Build your site')
		console.log('    serve,server,s Serve your site locally w/ livereload')
		console.log('')
		console.log('DOCS: https://github.com/DougBeney/Jekyll-Bliss/blob/master/README.md')
		console.log('')
	})
	.parse(process.argv)

if(cli.args.length > 0) {
	// Checking for CLI options
	var CMD = cli.args[0]
	if (['serve', 'server', 's'].indexOf(CMD) !== -1){
		user_config['jekyll-bliss']['watch'] = true
		user_config['jekyll-bliss']['livereload'] = true
	} else if (CMD == 'build'){

	} 
} else {
	// If no arguments are provided, show help menu and quit
	cli.help()
}

// Starting Jekyll-Bliss
console.log("You're now living in a Jekyll-Bliss, baby.")
var init_series = tasks.concat(['jekyll', 'browser-sync'])
gulp.task('init', init_series, function(){
	if (user_config['jekyll-bliss']['watch']) {
		DEBUG("Watching is enabled")
		gulp.start('watch')
	} else {
		DEBUG("Watching is disabled")
	}
})
gulp.start('init')
