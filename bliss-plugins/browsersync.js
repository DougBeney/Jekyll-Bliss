class PugPlugin {
    constructor() {
        this.name = "BrowserSync"
        this.type = this.PRESENTATION
        this.modules = []
        this.requireWhenNeeded('browser-sync')
        this.browserSyncObject = null
    }
    setup(sitePath) {
        this.ensureModuleExists("browser-sync")
        var bs = this.modules["browser-sync"].create()
        bs.init({
            server: {
                baseDir: sitePath,
                serveStaticOptions: {
                    extensions: ["html"]
                }
            }
        })
        this.browserSyncObject = bs
    }
    reload() {
        var bs = this.browserSyncObject
        if ( bs != null)
            bs.reload()
    }
}
module.exports = PugPlugin
