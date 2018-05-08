#!/usr/bin/env node
/* Jekyll-Bliss
 * by Doug Beney
 * https://dougie.io/
 * ---
 *
 * Terminology:
 *   Build Folder: Folder where we move source files and compile assets (Pug, sass, etc) to.
 *   Destination Folder: Where Jekyll builds our site to.
 */

var fs          = require('fs')
var gulp        = require('gulp')
var gdebug      = require('gulp-debug')
var cache       = require('gulp-cached')
var watch       = require('gulp-watch')
// var pug         = require('./gulp-pug-custom/index.js')
var pug = require('gulp-pug-frontmatter-support')
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
		"debug": false,
		"livereload": false,
		"watch": false
	},
}

var tasks = ["pug", "misc"]
var directory = process.cwd()
var filetype_excludes_from_misc = [
	"!**/*.pug",
	"!**/*/node_modules/**/*",
	"!**/*/node_modules/"
]
var jekyll_build_in_progress = false
var allFilesButExcludedPattern = []

function getbuildfolder(){
	return path.join(directory, user_config['jekyll-bliss']['build-folder'])
}

function getpath(arg="") {
	return path.join(directory, arg)
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
	return pattern
}

gulp.task('pug', function() {
	return gulp.src(getpath('**/*.pug'))
		.pipe(cache('pug'))
		.pipe(pug())
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

// Adding our build folders to the filetype exclude list
filetype_excludes_from_misc.push("!"+path.join(directory, user_config['jekyll-bliss']['build-folder']+'/**/*'))
filetype_excludes_from_misc.push("!"+path.join(directory, user_config['jekyll-bliss']['build-folder']+'/'))

// Adding our destination folders to the filetype exclude list
filetype_excludes_from_misc.push("!"+path.join(directory, user_config['destination'], '/**/*'))
filetype_excludes_from_misc.push("!"+path.join(directory, user_config['destination'], '/'))

var allFilesButExcludedPattern = allFilesButExcluded()

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

