class SassPlugin {
    constructor() {
        this.name = "Sass"
        this.type = this.PREPROCESSOR
        this.extensions = [".scss", ".sass"]
        this.output_extension = ".css"
        this.might_have_frontmatter = true
        this.modules = []
        this.requireWhenNeeded('path')
        this.requireWhenNeeded('sass')
    }
    render(text) {
        // if empty string, return
        if (!text.trim())
            return ""
        this.ensureModuleExists('path')
        this.ensureModuleExists('sass')
        const path = this.modules['path']
        const sass = this.modules['sass']
		return sass.compileString(text)
    }
}
module.exports = SassPlugin
