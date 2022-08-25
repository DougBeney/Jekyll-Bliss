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
    render(text, filename) {
        // if empty string, return
        if (!text.trim())
            return ""
        this.ensureModuleExists('path')
        this.ensureModuleExists('sass')
        const path = this.modules['path']
        const sass = this.modules['sass']
		const syntax =
			filename.trim().toLowerCase().endsWith('.sass') ?
				'indented' :
				'scss'

		var options = {
			'syntax': syntax,
		}

		var loadPath = this.getOption('sass')
		if (loadPath)
			loadPath = loadPath['sass_dir']
		if (loadPath)
			options.loadPaths = [loadPath]

		return sass.compileString(text, options).css
    }
}
module.exports = SassPlugin
