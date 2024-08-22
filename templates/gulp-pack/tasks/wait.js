var gulp = require('gulp');
gulp.task('wait', function(cb) {
    setTimeout(cb, 100);
});