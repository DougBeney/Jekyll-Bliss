var commander = require('commander')
module.exports = { 
	StartCLI: function(data) {
		commander
			.version(data.VERSION)
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

		if(commander.args.length > 0) {
			// Checking for CLI options
			var CMD = commander.args[0]
			if (['serve', 'server', 's'].indexOf(CMD) !== -1){
				data.user_config['jekyll-bliss']['watch'] = true
				data.user_config['jekyll-bliss']['livereload'] = true
			} else if (CMD == 'build'){
				// Nothing needed to configure
			} 
		} else {
			// If no arguments are provided, show help menu and quit
			commander.help()
		}
		console.log("You're now living in a Jekyll-Bliss, baby.")
		data['gulp'].start('init')
	}
}
