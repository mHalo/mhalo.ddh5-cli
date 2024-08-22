var gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass')(require('sass')),
  newer = require('gulp-newer'),
  config = require('../config');

gulp.task('scss', function () {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(newer({
      dest: "./css",
      ext: '.css'
    }))
    //   .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    //   .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest("./css"));
});

