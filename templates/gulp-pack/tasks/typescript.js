var gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  newer = require('gulp-newer'),
  ts = require('gulp-typescript');

gulp.task('typescript', function () {
  return gulp
    .src("./typescripts/**/*.ts")
    .pipe(newer({
      dest: "./scripts",
      ext: '.js'
    }))
    .pipe(sourcemaps.init())
    .pipe(ts())
    .pipe(sourcemaps.write('./ts-sourcemaps'))
    .pipe(gulp.dest("./scripts"));
});
