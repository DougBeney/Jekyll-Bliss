const path        = require('path')
const fs          = require('fs')

const pug         = require('gulp-pug')
const sass        = require('gulp-sass')

const gdebug      = require('gulp-debug')
const cache       = require('gulp-cached')
const frontmatter = require('gulp-frontmatter-wrangler')
const waitUntil   = require('wait-until')
const browserSync = require('browser-sync').create();
const exec        = require('child_process').exec
const clean       = require('gulp-clean');

var first_build = true // Gets set to false after first build

module.exports = function(data, functions) {
	const gulp = data['gulp']
	var module = {
		task_list: ["pug", "sass", "misc"],
		jekyll_build_in_progress: false
	}

	var init_series = module.task_list
	gulp.task('init', init_series, function(){
		if (data.user_config['jekyll-bliss']['watch']) {
			functions.DEBUG("Watching is enabled")
			gulp.start('watch')
		} else {
			functions.DEBUG("Watching is disabled")
		}
		gulp.start('jekyll')
	})

	gulp.task('watch', function(){
		functions.Watch([functions.getpath('**/*.pug')], ['pug'])
		functions.Watch([functions.getpath('**/*.sass')], ['sass'])
		functions.Watch(data.allFilesButExcludedPattern, ['misc'])
		
		functions.Watch([path.join(functions.getbuildfolder(), '**/*')], ['jekyll'])
	})

	gulp.task('pug', function() {
		return gulp.src([functions.getpath('**/*.pug'), ...data.global_excludes])
			.pipe(frontmatter.take())
			.pipe(pug(data.user_config['pug']))
			.pipe(frontmatter.putBack())
			.pipe(gulp.dest(functions.getbuildfolder()))
			.pipe(gdebug({title: 'Pug Files', showFiles: false}))
	})

	gulp.task('sass', function() {
		return gulp.src([
			functions.getpath('**/*.sass'),
			functions.getpath('**/*.scss'),
			...data.global_excludes
		])
			.pipe(frontmatter.take())
			.pipe(sass(data.user_config['sass']))
			.pipe(frontmatter.putBack())
			.pipe(gulp.dest(functions.getbuildfolder()))
			.pipe(gdebug({title: 'Sass Files', showFiles: false}))
	})

	gulp.task('misc', function() {
		return gulp.src(data.allFilesButExcludedPattern)
			.pipe(cache('misc'))
			.pipe(gulp.dest(functions.getbuildfolder()))
			.pipe(gdebug({title: 'Misc. Files', showFiles: false}))
	})

	gulp.task('jekyll', function() {
		if(data.user_config['jekyll-bliss']['skip-jekyll']) {
			var build_folder_pattern =
				path.join(functions.getbuildfolder(), '**/*')
			return gulp.src(build_folder_pattern)
				.pipe(gulp.dest(functions.getdestfolder()))
				.on('end', function() {
					gulp.start('delete_build_folder')
				})
		} else {
			waitUntil(250, Infinity, function condition() {
				return ((module.jekyll_build_in_progress == false) ? true : false);
			}, function done(result) {
				module.jekyll_build_in_progress = true
				// Build Jekyll
				var cmd_dest = ' --destination '+functions.getdestfolder()
				var cmd_bundle = (fs.existsSync(functions.getpath('Gemfile'))) ? "bundle exec " : ""
				var cmd = cmd_bundle+'jekyll build'+cmd_dest
				functions.DEBUG('Using this Jekyll build command:\n' + cmd)
				exec(cmd, {
					cwd: functions.getbuildfolder()
				}, function(error, stdout, stderr) {
					console.log(stdout)
					console.log(stderr)
					if (data.user_config['jekyll-bliss']['delete-build-folder']) {
						gulp.start('delete_build_folder')
					}
					if (data.user_config['jekyll-bliss']['livereload']) {
						if (first_build) {
							gulp.start('browser-sync')
							first_build = false
						}
						browserSync.reload()
					}
				});
				module.jekyll_build_in_progress = false
			});
		}
	})

	gulp.task('delete_build_folder', function() {
		return gulp.src(functions.getbuildfolder(), {read: false})
			.pipe(clean())
	})

	gulp.task('clean', ['delete_build_folder'], function() {
		gulp.src(functions.getdestfolder(), {read: false})
			.pipe(clean())
		console.log('successfully cleaned.')
		process.exit()
	})

	gulp.task('browser-sync', function() {
		if (data.user_config['jekyll-bliss']['livereload']) {
			functions.DEBUG("Livereload is enabled")
			// Make sure watching is enabled
			// Without watching, livereload is pointless
			data.user_config['jekyll-bliss']['watch'] = true
			browserSync.init({
				server: {
					baseDir: path.join(data.directory, data.user_config['destination']),
					serveStaticOptions: {
						extensions: ["html"]
					}
				}
			});
		} else {
			functions.DEBUG("Livereload is disabled")
		}
	})
	return module
}

