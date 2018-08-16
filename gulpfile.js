const gulp = require('gulp');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const sourcemaps = require("gulp-sourcemaps");
const babel = require('gulp-babel');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const rename = require('gulp-rename');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const pump = require('pump');
const gulputil = require('gulp-util');
const pug = require('gulp-pug');
const prettify = require('gulp-html-prettify');
const plumber = require('gulp-plumber');
const beautify = require('gulp-beautify');
const imagemin = require('gulp-imagemin');

// PostCSS plugins
var plugins = [
  autoprefixer({
    browsers: ['last 2 versions']
  }),
  cssnano()
];

// Scripts
const scriptsOrder = [
  'node_modules/babel-polyfill/dist/polyfill.js',
  'source/js/libs/progressbar.min.js',
  'source/js/app.js'
];

// Javascripts
gulp.task('js', function(cb) {
  return gulp.src(scriptsOrder)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./docs/assets/js/'))
    .pipe(reload({
      stream: true
    }));
});


// Stylesheets
gulp.task('sass', function() {
  return gulp.src('./source/sass/main.scss')
    .pipe(sourcemaps.init())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./docs/assets/css/'))
    .pipe(reload({
      stream: true
    }));
});

// HTML
gulp.task('html', function() {
  return gulp.src('./source/pug/*.pug')
    .pipe(plumber())
    .pipe(pug())
    .pipe(gulp.dest('./docs/'))
    .pipe(reload({
      stream: true
    }));
});

// BrowserSync
gulp.task('browser-sync', function() {
  browserSync.init({
    server: "docs"
  });
});

// Images
gulp.task('images', function() {
  gulp.src('source/images/**/*')
    .pipe(imagemin({
      interlaced: true,
      progressive: true,
      optimizationLevel: 7
    }))
    .pipe(gulp.dest('docs/assets/images'))
});

// Build
gulp.task('build', ['js', 'sass', 'html']);

// Default
gulp.task('default', ['sass', 'js', 'browser-sync'], function() {
  gulp.watch('./source/sass/**/*.scss', ['sass']);
  gulp.watch('./source/js/app.js', ['js']);
  gulp.watch('./source/pug/**/*.pug', ['html']);
});
