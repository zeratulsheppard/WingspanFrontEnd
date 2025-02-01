const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const moduleImporter = require('sass-module-importer');
const purgecss = require('gulp-purgecss');
const postcss = require('gulp-postcss');
const css_mqpacker = require('css-mqpacker');
const mqextract = require('postcss-mq-extract');
const addsrc = require('gulp-add-src');
const cssnano = require('cssnano');
const rename = require('gulp-rename');

const paths = {
  sass: './src/sass/app.scss',
  css: [
    './dest/css/app.css',
    './dest/css/vue.css',
    './dest/css/*.vue.css',
  ],
  purgeContent: [
    './src/**/*.js',
    './src/**/*.vue',
    './dest/index-view.html',
    './dest/**/*.js',
  ],
  destCss: './dest/css/',
  watchFiles: [
    './dest/index.html',
    './dest/css/vue.css',
    './src/js/**/*.js',
    './src/js/**/*.vue',
    './src/sass/**/*.scss',
  ],
  desktopCss: './dest/css/*-desktop.css'
};

gulp.task('sass', () => {
  return gulp.src(paths.sass)
    .pipe(sourcemaps.init())
    .pipe(sass({ importer: moduleImporter() }).on('error', sass.logError))
    .pipe(purgecss({ content: paths.purgeContent }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.destCss));
});

gulp.task('css', () => {
  return gulp.src(paths.css, { allowEmpty: true })
    .pipe(sourcemaps.init())
    .pipe(postcss([
      css_mqpacker(),
      mqextract({
        dest: paths.destCss,
        match: '(min-width: 768px|min-width: 992px|min-width: 1200px)',
        postfix: '-desktop',
      }),
    ]))
    .pipe(postcss([cssnano({ preset: 'default' })]))
    .pipe(rename({ extname: ".min.css" }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.destCss));
});

gulp.task('minify-desktop', () => {
  return gulp.src(paths.desktopCss)
    .pipe(sourcemaps.init())
    .pipe(postcss([cssnano({ preset: 'default' })]))
    .pipe(rename({ extname: ".min.css" }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.destCss));
});

gulp.task('sass:watch', () => {
  gulp.watch(paths.watchFiles, gulp.series('sass', 'css', 'minify-desktop'));
});

gulp.task('default', gulp.series('sass', 'css', 'minify-desktop'));
gulp.task('watch', gulp.series('sass', 'css', 'minify-desktop', 'sass:watch'));
