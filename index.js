#!/usr/bin/env node
var gulp = require('gulp')
var pug  = require('gulp-pug')
var path = require('path');

var tasks = ["pug", "misc"]
var directory = process.cwd()
var source_dir = ""

// Main Variables
var filetype_excludes_from_misc = [
	"!**/*.pug",
	"!"+path.join(directory, 'build/**/*'), // Files in build folder
	"!"+path.join(directory, 'build/') // Build folder itself
]

// TODO: read _config.yml

function getpath(arg="") {
	return path.join(directory, source_dir, arg)
}

gulp.task('pug', function() {
	return gulp.src('**/*.pug')
		.pipe(pug())
		.pipe(gulp.dest(getpath('build')))
})

gulp.task('misc', function() {
	var pattern = [getpath("**/*")]
	//TODO If pattern=array then process it differently
	for (item of filetype_excludes_from_misc) {
		pattern.push(item)
	}
	return gulp.src(pattern)
		.pipe(gulp.dest(getpath('build')))
})

gulp.task('watch', tasks, function(){
	gulp.watch(getpath("**/*.pug"), ['pug'])
})

gulp.start('watch')
