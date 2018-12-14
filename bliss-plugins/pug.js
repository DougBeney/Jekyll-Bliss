class PugPlugin {
    constructor() {
        this.name = "Pug"
        this.type = this.PREPROCESSOR
        this.extensions = [".pug"]
        this.output_extension = ".html"
        this.might_have_frontmatter = true
        this.modules = []
        this.requireWhenNeeded('path')
        this.requireWhenNeeded('pug')
    }
    render(text) {
        // if empty string, return
        if (!text.trim())
            return ""
        this.ensureModuleExists('path')
        this.ensureModuleExists('pug')
        const path = this.modules['path']
        const pug = this.modules['pug']
        const userSourcePath = this.getOption("source")
        const includesPath = path.join(userSourcePath ? userSourcepath : "", "_includes/this-is-a-silly-hack.pug")
        return pug.render(text, {filename: includesPath, pretty: true})
    }
}
module.exports = PugPlugin
