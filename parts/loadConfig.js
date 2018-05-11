const fs   = require('fs')
const path = require('path')
const yaml = require('js-yaml')

module.exports = function(data, functions) {
	var config_path = path.join(data.directory, '_config.yml')
	if (fs.existsSync(config_path)) {
		try {
			var ymlfile = fs.readFileSync(config_path, 'utf8')
			var loaded_config = yaml.safeLoad(ymlfile)
			var jekyll_bliss_backup = data.user_config['jekyll-bliss']
			if (!loaded_config['jekyll-bliss']) {
				loaded_config['jekyll-bliss'] = {}
			}
			loaded_config['jekyll-bliss'] = Object.assign(
				data.user_config['jekyll-bliss'],
				loaded_config['jekyll-bliss']
			)
			data.user_config = Object.assign(
				data.user_config,
				loaded_config
			)
			if(data.user_config['jekyll-bliss'] == null) {
				data.user_config['jekyll-bliss'] = jekyll_bliss_backup
			}
		} catch (e) {
			console.log(e);
		}
	} else {
		functions.DEBUG("Not using a _config.yml. Does not exist.")
	}
}
