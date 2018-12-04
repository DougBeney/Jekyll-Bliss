class PugPlugin {
    constructor() {
        this.name = "Pug"
        this.type = this.PREPROCESSOR
        this.extensions = [".pug"]
        this.output_extension = ".html"
        this.might_have_frontmatter = true
				this.modules = []
        this.requireWhenNeeded('pug')
    }
    render(text) {
				// if empty string, return
				if (!text.trim())
						return ""
				this.ensureModuleExists('pug')
        return this.modules['pug'].render(text)
    }
}
module.exports = PugPlugin
