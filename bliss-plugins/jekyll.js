class JekyllPlugin {
    constructor() {
        this.name = 'Jekyll'
        this.type = this.COMPILER
				this.modules = []
        this.requireWhenNeeded('child_process')
        this.requireWhenNeeded('util')
				this.requireWhenNeeded('fs')
    }
    compile(sourceDirectory, outputDirectory) {
				this.ensureModuleExists('child_process')
				this.ensureModuleExists('util')
				this.ensureModuleExists('fs')

				var exec = this.modules['child_process'].exec
				var format = this.modules['util'].format
				var fs = this.modules['fs']

				// Creating the build command.
				// If a config exists, we'll specify it.
				var cmd = format('jekyll build --source "%s"', sourceDirectory)
				if ( fs.existsSync("_config.yml") )
						cmd += " --config _config.yml"

				this.debug("Building site using command:", "'"+cmd+"'")

				var self = this // create alias to this since we're not able toaccess it in callback
				exec(cmd, function(error, stdout, stderr) {
						if ( stdout )
								console.log(stdout)
						if ( stderr)
								console.error(stderr)

						var shouldDeleteBuildFolder = self.getOption("jekyll-bliss")["delete-build-folder"]
						if ( shouldDeleteBuildFolder ) {
								var delete_cmd = format('rm -rf "%s"' , sourceDirectory);
								self.debug( format("Deleting build folder '%s' using command '%s'", sourceDirectory, delete_cmd))
								exec( delete_cmd )
						}
				})
    }
}
module.exports = JekyllPlugin
