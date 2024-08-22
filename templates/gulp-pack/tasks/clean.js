var gulp = require('gulp'),
    clean = require("gulp-clean"),
    merge = require('merge-stream'),
    config = require('../config');

var gulpCfg = config.getClean();
gulp.task('clean', function() {
    var tasks = config.taskBox();
    Object.keys(gulpCfg).map(function(name){
        var cfg = gulpCfg[name].get();
        var canForce =  cfg.source.filter(s => s.indexOf("~") == 0 || s.indexOf('/') == 0).length == 0;
        var _task = gulp.src(cfg.source, {
            read: false
        }).pipe(clean({
            force: canForce
        }));
        tasks.push(_task);
    });
    return merge(...tasks);
});