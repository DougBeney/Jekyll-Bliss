module.exports = {
	gulp: require('gulp'), // This is the gulp instance that will hold all of our tasks.
	user_config: {
		"source": "",
		"destination": "_site",
		"exclude": [],
		"jekyll-bliss": {
			"build-folder": "_build",
			"delete-build-folder": true,
			"source": ".",
			"debug": false,
			"livereload": false,
			"watch": false
		}
	},

	global_excludes: [],
	filetype_excludes_from_misc: [
		"!**/*.pug",
		"!**/*.sass",
		"!**/*.scss",
	],
	allFilesButExcludedPattern: [],

	VERSION: require('../package.json').version,
	directory: process.cwd(),
}

