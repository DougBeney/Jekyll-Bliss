Jekyll-Bliss: The Answer to Slow Compile Times
---

# ⚠ Status: Minimum Functionality ⚠

Right now this only compiles Pug files. Sass, (probably) Markdown, Javascript/webpack support coming soon!!

# Introduction

Jekyll is my favorite static site generator because it is very non-opinionated. The folder structure is super simplistic and feels natural.

However, there is one major problem with Jekyll: **The compile time**. If you have a small site, this may not be a problem, but once you start accumulating many posts, installing a variety of plugins and using many files that should be preprocessed, your compile time will skyrocket.

The aims of this project is to allow Jekyll-Bliss to do all of the heavy-lifting (Markdown, JS, Sass/SCSS, Pug compilation, etc) and allow Jekyll to do the smallest amount of work possible - compiling HTML files.

# Usage

At the moment, I have not uploaded this to the NPM repository.

To use, `git clone` this repo somewhere safe on your computer. In the directory, run `npm link`. Now you should be able to use the `jekyllbliss` terminal command anywhere.

`cd` into a Jekyll project and then run `jekyllbliss`.

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

# Results from using Jekyll-Bliss

## Before:
bundle exec jekyll build  5.27s user 0.34s system 101% cpu 5.516 total
