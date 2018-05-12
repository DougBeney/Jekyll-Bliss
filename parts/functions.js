const path  = require('path')
const watch = require('gulp-watch')

module.exports = function(data) {
	var module = {}
	module.StartAndWatch = function(pattern_array, task_array_to_run) {
		const gulp = data['gulp']
		watch(pattern_array, {"ignoreInitial": true}, function(vinyl) {
			gulp.start(task_array_to_run)
			var filename = vinyl.path.replace(data.directory, '')
			var event_type = vinyl.event
			console.log("%s (%s)", filename, event_type)
		})
	},

	module.getbuildfolder = function(){
		return path.join(data.directory, data.user_config['jekyll-bliss']['build-folder'])
	}
	module.getdestfolder = function(){
		return path.join(data.directory, data.user_config['destination'])
	}

	module.getpath = function(arg="") {
		return path.join(data.directory, arg)
	}

	module.getsourcepath = function(arg="") {
		return path.join(data.directory, data.user_config['source'], arg)
	}

	module.DEBUG = function(string) {
		if (data.user_config['jekyll-bliss']['debug']) {
			console.log('[DEBUG] %s', string)
		}
	}

	return module
}
