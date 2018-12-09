class JekyllPlugin {
    constructor() {
        this.name = 'Jekyll'
        this.type = this.COMPILER
        this.modules = []
        this.requireWhenNeeded('child_process')
        this.requireWhenNeeded('util')
        this.requireWhenNeeded('fs')
        this.requireWhenNeeded('path')
    }
    compile(sourceDirectory, outputDirectory) {
        this.ensureModuleExists('child_process')
        this.ensureModuleExists('util')
        this.ensureModuleExists('fs')

        var exec = this.modules['child_process'].exec
        var format = this.modules['util'].format
        var fs = this.modules['fs']
        var path = this.modules['path']

        // Creating the build command.
        // If a config exists, we'll specify it.
        var cmd = format('jekyll build --trace --source ./ --destination "%s"', path.join('../', this.getOption('destination')))
        if ( fs.existsSync("_config.yml") )
            cmd += " --config _config.yml"

        this.debug("Building site using command:", "'"+cmd+"'")

        if ( fs.existsSync(path.join(sourceDirectory, "Gemfile")) )
            cmd = "bundle exec " + cmd

        var self = this // create alias to this since we're not able toaccess it in callback
        exec(cmd, {
            cwd: sourceDirectory
        }, function(error, stdout, stderr) {
            if ( stdout && !self.getOption("jekyll-bliss")["quiet"] )
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
