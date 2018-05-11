const path = require('path')

module.exports = function(data, functions) {
	var module = {}
	module.getFolderExcludePatterns = function(folder) {
		return [
			path.join("!**/", folder , '/**/*'),
			path.join("!**/", folder)
		]
	}

	module.getFileExcludePattern = function(file) {
		return path.join("!**/", file)
	}

	module.allFilesButExcluded = function() {
		var pattern = [functions.getpath("**/*")]
		//TODO If pattern=array then process it differently
		for (item of data.filetype_excludes_from_misc) {
			pattern.push(item)
		}
		for (item of data.global_excludes) {
			pattern.push(item)
		}
		return pattern
	}
	// Excluding the build folder and dest folder from being compiled
	var build_folder = data.user_config['jekyll-bliss']['build-folder']
	var dest_folder  = data.user_config['destination']
	data.filetype_excludes_from_misc.push(...module.getFolderExcludePatterns(build_folder))
	data.filetype_excludes_from_misc.push(...module.getFolderExcludePatterns(dest_folder))

	// Macros for two functions
	var filep = module.getFileExcludePattern
	var foldp = module.getFolderExcludePatterns

	// Exclude pesky files/folders such as node_modules/, package.json, .git/, etc.
	data.filetype_excludes_from_misc.push(...[
		...foldp('.git'),
		filep('package.json'),
		filep('package-lock.json'),
		filep('.DS_Store'), // Remove annoying DS Store files on Mac OS X
	])
	data.global_excludes.push(...[
		...foldp('node_modules') // Putting node_modules under Global because it could include to-be-processed files (ex. Pug include Pug template examples.)
	])

	// Pattern for every single file type except for excluded
	data.allFilesButExcludedPattern = module.allFilesButExcluded()

	return module
}

