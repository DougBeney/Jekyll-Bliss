
class JekyllPlugin {
    constructor() {
        this.name = 'Jekyll'
        this.type = this.COMPILER
        this.requireWhenNeeded('child_process')
        this.requireWhenNeeded('util')
    }
    compile(sourceDirectory, outputDirectory) {
				this.ensureModuleExists('child_process')
				this.ensureModuleExists('util')
				var exec = this.modules['child_process'].exec
				var format = this.modules['util'].format
				var cmd = format('jekyll build --config _config.yml --source "%s"', sourceDirectory)
				console.log("THE CMD", cmd)
				exec(cmd, function(error, stdout, stderr) {
						if ( stdout )
								console.log(stdout)
						if ( stderr)
								console.error(stderr)
				})
    }
}
module.exports = JekyllPlugin
