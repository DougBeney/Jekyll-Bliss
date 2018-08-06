class JekyllPlugin {
	constructor() {
		this.name = "Jekyll"
		this.type = this.COMPILER
		//this.requireWhenNeeded('some NPM module')
	}
	compile(siteDirectory, outputDirectory) {
		// Code to execute jekyll in a directory
		// and output it to the outputDirectory
	}
}
module.exports = JekyllPlugin
