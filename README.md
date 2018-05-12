Jekyll-Bliss: The Answer to Slow Compile Times
---

# ⚠ Status: Pug and Sass/SCSS Optimization Only ⚠

A ton of optimization is coming soon.

Currently, this plugin will optimize your Pug, Sass, and CSS.

Jekyll is still in charge of compiling other filetypes such as Markdown, Javascript, and more.

# Installation

To install: `npm install jekyll-bliss -g`

# Introduction

Jekyll is my favorite static site generator because it is very non-opinionated. The folder structure is super simplistic and feels natural.

However, there is one major problem with Jekyll: **The compile time**. If you have a small site, this may not be a problem, but once you start accumulating many posts, installing a variety of plugins and using many files that should be preprocessed, your compile time will skyrocket.

The aims of this project is to allow Jekyll-Bliss to do all of the heavy-lifting (Markdown, JS, Sass/SCSS, Pug compilation, etc) and allow Jekyll to do the smallest amount of work possible - compiling HTML files.

# Usage

The command is `jekyllbliss`.

```
  Usage: jekyllbliss [options]

  Options:

    -V, --version  output the version number
    -h, --help     output usage information

  Commands:

    build          Build your site
    serve,server,s Serve your site locally w/ livereload
```

## Development usage

If you'd like to tweak around with this project, do the following.

`git clone` this repo. Cd into its directory and run `npm link`. Now you should be able to use the `jekyllbliss` terminal command anywhere.

`cd` into a Jekyll project and then run `jekyllbliss` to test.

I like to have split terminal windows open. One in the Jekyll-Bliss project directory with `index.js` opened and another in a test jekyll site project directory.

# Configuration

Here are the default values Jekyll-Bliss uses. You can override these in your _config.yml

```yml
source: ""
destination: "_site"
jekyll-bliss:
  build-folder: "_build"
  debug: false
  livereload: false
  watch: false
```

**Note:** If you enable `livereload`, `watch` will automatically be enabled too.

# Results from using Jekyll-Bliss

I gave Jekyll-Bliss a test on my personal site, [dougie.io](https://dougie.io)

Keep in mind that the major performance boosters (Sass, Markdown, and JS processing) isn't even implemented yet. This is just removing Jekyll-Pug to allow Pug to be processed by Jekyll-Bliss.

## Before:
bundle exec jekyll build  5.27s user 0.34s system 101% cpu 5.516 total

## After:

**UPDATE 05/12/2018**: jekyllbliss build  2.03s user 0.18s system 132% cpu 1.662 total

~jekyllbliss  3.96s user 0.22s system 112% cpu 3.715 total~

# Migrating from Jekyll-Pug to Jekyll-Bliss

Jekyll-Bliss is nearly a drop-in replacement!

First, remove Jekyll-Pug from your Gemfile.

Then, you have to prefix all of your Pug includes with the name of your include folder (`_includes/` by default).

Note, if you used Liquid includes for Pug (`{% include nav.pug %}`) you should change that to include an HTML file instead, which Jekyll-Bliss will generate. (`{% include nav.html %}`)

That's it! Enjoy!

# Future

For the time being, Jekyll-Bliss will remain a wrapper that goes over the top of Jekyll.

In the future, I would like to either:

- Fork Jekyll, strip it of its unneeded features when in pair with Jekyll-Bliss to decrease compile times further. Package the fork with Jekyll-Bliss
- ..or create a minimal clone of Jekyll right in Node

Let's see where this project takes us!

# Donate

If this project helps you out, I'd greatly appreciate a donation of any size.

[![Beerpay](https://img.shields.io/beerpay/hashdog/scrapfy-chrome-extension.svg)](https://beerpay.io/DougBeney/Jekyll-Bliss)

