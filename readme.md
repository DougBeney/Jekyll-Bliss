Jekyll-Bliss 2.0: The Answer to Slow Build Times in Jekyll
---

# 2.0?

Jekyll-Bliss 2.0 is a complete re-write of the first version. It is MUCH lighter on dependencies. It has cut out the need for Gulp.

If you run into any sort of bugs, please make sure to report them.

# Introduction

Jekyll is my favorite static site generator because it is very non-opinionated. The folder structure is super simplistic and feels natural.

However, there is one major problem with Jekyll: **The build time**. If you have a small site, this may not be a problem, but once you start accumulating many posts, installing a variety of plugins and using many files that should be preprocessed, your build time will skyrocket.

The aims of this project is to allow Jekyll-Bliss to do all of the heavy-lifting (Markdown, JS, Sass/SCSS, Pug, etc) and allow Jekyll to do the smallest amount of work possible - compiling HTML files.

# Installation

To install: `npm install jekyll-bliss -g`

# Usage

The command is `bliss`.

```
Usage: bliss [options]

Options:
  -V, --version          output the version number
  b, build               Build your site.
  s, serve               Builds & watches your site, creates server, enables livereload.
  config                 View configuration used to build site.
  -c, --compiler [name]  Specify a compiler plugin. Default is "Jekyll".
  -d, --debug            Enable debug messages.
  -q, --quiet            Don't output anything to the terminal. Will still print debug info (if enabled) and error messages.
  -h, --help             output usage information

```

# Configuration

Here are the default values Jekyll-Bliss uses. You can override these in your _config.yml

```yml
source: ''
destination: _site
jekyll-bliss:
  build-folder: _build
  debug: false
  quiet: false
  delete-build-folder: true
  livereload: true
```

# Results from using Jekyll-Bliss

**Note**: This 'Results' section hasn't been updated for Jekyll 2.0.

I gave Jekyll-Bliss a test on my personal site, [dougie.io](https://dougie.io)

Keep in mind that a lot of optimization is yet to come and the build times will only shrink.

## Before:
bundle exec jekyll build  5.27s user 0.34s system 101% cpu 5.516 total

## After:

**UPDATE 05/12/2018**: bliss build  2.03s user 0.18s system 132% cpu 1.662 total

~bliss  3.96s user 0.22s system 112% cpu 3.715 total~

# Using Jekyll-Pug? How to migrate from Jekyll-Pug to Jekyll-Bliss

Jekyll-Bliss is nearly a drop-in replacement!

First, remove Jekyll-Pug from your Gemfile.

Then, you have to prefix all of your Pug includes with the name of your include folder (`_includes/` by default).

Note, if you used Liquid includes for Pug (`{% include nav.pug %}`) you should change that to include an HTML file instead, which Jekyll-Bliss will generate. (`{% include nav.html %}`)

That's it! Enjoy!

## Development usage

If you'd like to tweak around with this project, do the following to set up an awesome dev environment.

`git clone` this repo. Cd into its directory and run `npm link`. Now you should be able to use the `bliss` terminal command anywhere.

`cd` into a Jekyll project somewhere else on your computer and then run `bliss` to test.

I like to have split terminal windows open. One in the Jekyll-Bliss project directory with `index.js` opened and another in a test jekyll site project directory.

# Donate

If this project helps you out, I'd greatly appreciate a donation of any size.

[![Beerpay](https://img.shields.io/beerpay/hashdog/scrapfy-chrome-extension.svg)](https://beerpay.io/DougBeney/Jekyll-Bliss)
