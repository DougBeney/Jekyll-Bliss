class PugPlugin {
    constructor() {
        this.name = "Pug"
        this.type = this.PREPROCESSOR
        this.extensions = [".pug"]
        this.output_extension = ".html"
        this.might_have_frontmatter = true
        this.requireWhenNeeded('pug')
    }
    render(text) {
        if (this.modules['pug']) {
            return this.modules['pug'].render(text)
        } else {
            this.fatal_error("Error. 'pug' is null")
        }
    }
}
module.exports = PugPlugin
