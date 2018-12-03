/*
 * This library is adapted from front-matter:
 * https://github.com/jxson/front-matter/
 *
 * The key difference is that it doesn't parse
 * the YAML into a JS object.
 */

var optionalByteOrderMark = '\\ufeff?'
var pattern = '^(' +
    optionalByteOrderMark +
    '(= yaml =|---)' +
    '$([\\s\\S]*?)' +
    '^(?:\\2|\\.\\.\\.)' +
    '$' +
    (process.platform === 'win32' ? '\\r?' : '') +
    '(?:\\n)?)'

// NOTE: If this pattern uses the 'g' flag the `regex` variable definition will
// need to be moved down into the functions that use it.
var regex = new RegExp(pattern, 'm')

module.exports = extractor

function extractor (string) {
    string = string || ''

    var lines = string.split(/(\r?\n)/)
    if (lines[0] && /= yaml =|---/.test(lines[0])) {
        return parse(string)
    } else {
        return { frontmatter: '', body: string }
    }
}

function parse (string) {
    var match = regex.exec(string)

    if (!match) {
        return {
            frontmatter: "",
            body: string
        }
    }

    var yaml = match[match.length - 1].replace(/^\s+|\s+$/g, '')
    yaml = "---\n"+yaml+"\n---\n\n"
    var body = string.replace(match[0], '')

    return { frontmatter: yaml, body: body }
}
