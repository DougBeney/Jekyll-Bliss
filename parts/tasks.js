const path        = require('path')
const fs          = require('fs')

const gdebug      = require('gulp-debug')
const cache       = require('gulp-cached')
const pug         = require('gulp-pug')
const frontmatter = require('gulp-frontmatter-wrangler')
const waitUntil   = require('wait-until')
const browserSync = require('browser-sync').create();
const exec        = require('child_process').exec

module.exports = function(data, functions) {
	const gulp = data['gulp']
	var module = {
		task_list: ["pug", "misc"],
		jekyll_build_in_progress: false
	}

	var init_series = module.task_list.concat(['jekyll', 'browser-sync'])
	gulp.task('init', init_series, function(){
		if (data.user_config['jekyll-bliss']['watch']) {
			functions.DEBUG("Watching is enabled")
			gulp.start('watch')
		} else {
			functions.DEBUG("Watching is disabled")
		}
	})

	gulp.task('watch', function(){
		functions.StartAndWatch([functions.getpath('**/*.pug')], ['pug'])
		functions.StartAndWatch(data.allFilesButExcludedPattern, ['misc'])
		//When any files are changed in the build folder, run Jekyll
		functions.StartAndWatch([functions.getbuildfolder()], ['jekyll'])
	})

	gulp.task('pug', function() {
		return gulp.src([functions.getpath('**/*.pug'), ...data.global_excludes])
			.pipe(cache('pug'))
			.pipe(frontmatter.take())
			.pipe(pug())
			.pipe(frontmatter.putBack())
			.pipe(gulp.dest(functions.getbuildfolder()))
			.pipe(gdebug({title: 'Pug Files', showFiles: false}))
	})

	gulp.task('misc', function() {
		return gulp.src(data.allFilesButExcludedPattern)
			.pipe(cache('misc'))
			.pipe(gulp.dest(functions.getbuildfolder()))
			.pipe(gdebug({title: 'Misc. Files', showFiles: false}))
	})

	gulp.task('jekyll', function() {
		waitUntil(250, Infinity, function condition() {
			return ((module.jekyll_build_in_progress == false) ? true : false);
		}, function done(result) {
			module.jekyll_build_in_progress = true
			// Build Jekyll
			var dest = path.join(data.directory, data.user_config['destination'])
			var cmd_dest = ' --destination '+dest
			var cmd_bundle = (fs.existsSync(functions.getpath('Gemfile'))) ? "bundle exec " : ""
			var cmd = cmd_bundle+'jekyll build'+cmd_dest
			functions.DEBUG('Using this Jekyll build command:\n' + cmd)
			exec(cmd, {
				cwd: functions.getbuildfolder()
			}, function(error, stdout, stderr) {
				console.log(stdout)
				if (data.user_config['jekyll-bliss']['livereload']) {
					browserSync.reload()
				}
			});
			module.jekyll_build_in_progress = false
		});
	})

	gulp.task('browser-sync', function() {
		if (data.user_config['jekyll-bliss']['livereload']) {
			functions.DEBUG("Livereload is enabled")
			// Make sure watching is enabled
			// Without watching, livereload is pointless
			data.user_config['jekyll-bliss']['watch'] = true
			browserSync.init({
				server: {
					baseDir: path.join(data.directory, data.user_config['destination'])
				}
			});
		} else {
			functions.DEBUG("Livereload is disabled")
		}
	})
	return module
}

