var gulp = require('gulp'),
    merge = require('merge-stream'),
    run = require('gulp-run'),
    config = require('../config');

var gulpCfg = config.getRun();

gulp.task('run-cmd', function() {
    var tasks = config.taskBox();
    Object.keys(gulpCfg).map(function(name){
        var cfg = gulpCfg[name].get();
        var cmd = cfg.runCmd.join(' && ');
        console.info('run-cmd['+ name +']', cmd);
        var _task = gulp.src(cfg.source).pipe(run(cmd));
        tasks.push(_task);
    });
    return merge(...tasks);
});