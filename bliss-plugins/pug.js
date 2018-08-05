var pug = null

class PugPlugin {
	constructor() {
		this.name = "Pug"
		this.modules = ["pug"]
		this.extensions = [".pug"]
		this.output_extension = ".html"
		this.might_have_frontmatter = true
		pug = this.userRequire('pug')
	}
	render(text) {
		if (pug) {
			return pug.render(text)
		} else {
			this.fatal_error("Error. pug is null")
		}
	}
}
module.exports = PugPlugin
