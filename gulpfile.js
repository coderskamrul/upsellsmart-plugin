const gulp = require("gulp")
const sass = require("gulp-sass")(require("sass"))
const postcss = require("gulp-postcss")
const cleanCSS = require("gulp-clean-css")
const uglify = require("gulp-uglify")
const rename = require("gulp-rename")
const sourcemaps = require("gulp-sourcemaps")
const plumber = require("gulp-plumber")
const notify = require("gulp-notify")
const webpack = require("webpack-stream")
const webpackConfig = require("./webpack.config.js")
const webpackDevConfig = require("./webpack.dev.config.js")

const isProduction = process.env.NODE_ENV === "production"

// Error handling
const onError = function (err) {
  notify.onError({
    title: "Gulp Error",
    message: "Error: <%= error.message %>",
  })(err)
  this.emit("end")
}

// Compile SCSS - optimized for development
gulp.task("styles", () => {
  let stream = gulp
    .src(["src/assets/scss/**/*.scss"])
    .pipe(plumber({ errorHandler: onError }))

  // Only use sourcemaps in development
  if (!isProduction) {
    stream = stream.pipe(sourcemaps.init())
  }

  stream = stream
    .pipe(
      sass({
        outputStyle: isProduction ? "compressed" : "expanded",
        includePaths: ["node_modules"],
      }),
    )
    .pipe(postcss([require("tailwindcss"), require("autoprefixer")]))

  if (!isProduction) {
    stream = stream.pipe(sourcemaps.write("."))
  }

  stream = stream.pipe(gulp.dest("css"))

  // Only minify in production
  if (isProduction) {
    stream = stream
      .pipe(cleanCSS({ sourceMap: true }))
      .pipe(rename({ suffix: ".min" }))
      .pipe(gulp.dest("css"))
  }

  return stream
})

// Compile JavaScript with Webpack - using optimized config
gulp.task("scripts", () =>
  gulp
    .src(["src/admin/index.js", "src/frontend/index.js"])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(webpack(isProduction ? webpackConfig : webpackDevConfig))
    .pipe(gulp.dest("assets/dist")),
)

// Development-only webpack watch task - super fast rebuilds
gulp.task("scripts:watch", () =>
  gulp
    .src(["src/admin/index.js", "src/frontend/index.js"])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(webpack({
      ...webpackDevConfig,
      watch: true,
      watchOptions: {
        aggregateTimeout: 100, // Even faster rebuilds
        poll: false,
        ignored: /node_modules/,
      },
    }))
    .pipe(gulp.dest("assets/dist")),
)

// Copy assets
gulp.task("assets", () => gulp.src("src/assets/images/**/*").pipe(gulp.dest("assets/dist/images")))

// Fast watch for development - only watch specific files
gulp.task("watch", () => {
  // Use webpack's built-in watch for JS files (much faster)
  gulp.watch("src/**/*.js", { ignoreInitial: false }, gulp.series("scripts:watch"))

  // Only watch SCSS files that aren't handled by webpack
  gulp.watch(["src/assets/scss/**/*.scss"], { ignoreInitial: false }, gulp.series("styles"))

  // Watch images
  gulp.watch("src/assets/images/**/*", { ignoreInitial: false }, gulp.series("assets"))
})

// Development build task (faster)
gulp.task("build:dev", gulp.parallel("styles", "scripts", "assets"))

// Production build task (full optimization)
gulp.task("build:prod", gulp.series("styles", "scripts", "assets"))

// Build task - choose based on environment
gulp.task("build", isProduction ? gulp.series("build:prod") : gulp.series("build:dev"))

// Default task
gulp.task("default", gulp.series("build", "watch"))
