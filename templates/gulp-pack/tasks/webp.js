var gulp = require('gulp'),
    merge = require('merge-stream'), 
    rename = require('gulp-rename'), //文件重命名
    webp = require('gulp-webp'),
    config = require('../config');

    var gulpCfg = config.getWebP();

    gulp.task('webp', function() {
        var tasks = config.taskBox();
        Object.keys(gulpCfg).map(function(name){
            var cfg = gulpCfg[name].get();
            var _task = gulp.src(cfg.source)
                    .pipe(rename(function (file) {
                        file.extname += '.webp';
                    }))
                    .pipe(webp())
                    .pipe(gulp.dest(cfg.dest));
            tasks.push(_task);
        });
        return merge(...tasks);
    });

