#!/usr/bin/env node

/* Jekyll-Bliss
 * by Doug Beney
 * https://dougie.io/
 * ---
 *
 * Project Terminology:
 *   Build Folder: Folder where we move source files and compile assets (Pug, sass, etc) to.
 *   Destination Folder: Where Jekyll builds our site to.
 *   Misc task: The misc Gulp task copies around all of the files that don't need to be specially processed.
 *   Global Excludes: Exclude a folder or file GLOB pattern from ALL tasks.
 *   Misc Excludes: Exclude a folder or file GLOB pattern from the misc task.
 *   DEBUG: DEBUG is a function that console.logs only if DEBUG is enabled by the user
 */

const fs              = require('fs')
const path            = require('path')

const data            = require('./parts/data.js')
const functions       = require('./parts/functions.js')(data)
const excludePatterns = require('./parts/excludePatterns.js')(data, functions)
const tasks           = require('./parts/tasks.js')(data, functions)
const loadConfig      = require('./parts/loadConfig.js')(data, functions)
const cli             = require('./parts/cli')

// Starting Jekyll-Bliss
cli.StartCLI(data)
