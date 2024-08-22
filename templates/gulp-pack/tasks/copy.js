
var gulp = require('gulp'),
    merge = require('merge-stream'), 
    config = require('../config');
var gulpCfg = config.getCopy();

gulp.task('copy', function() {
    var tasks = config.taskBox(); 
    Object.keys(gulpCfg).map(function(name){
        var cfg = gulpCfg[name].get();
        var _task = gulp.src(cfg.source)
                    .pipe(gulp.dest(cfg.dest));
        tasks.push(_task);
    });
    return merge(...tasks);
});