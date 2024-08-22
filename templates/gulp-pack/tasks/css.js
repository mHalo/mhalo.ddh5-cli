var gulp = require('gulp'),
  gulpif = require('gulp-if'),
  autoprefixer = require('gulp-autoprefixer'),
  sourcemaps = require('gulp-sourcemaps'),
  merge = require('merge-stream'), //混合多个命令 
  cleanCss = require('gulp-clean-css'), //css压缩
  concat = require('gulp-concat'), //文件合并
  rename = require('gulp-rename'), //文件重命名
  replace = require('gulp-replace'),
  rev = require('gulp-rev'),
  insert = require('gulp-insert'),
  //gzip = require('gulp-gzip'), //gzip
  config = require('../config');

var gulpCfg = config.getCss();
gulp.task('css', function() {
    var tasks = config.taskBox();
    Object.keys(gulpCfg).map(function(name){
        var cfg = gulpCfg[name].get();
        var withConcat = !!cfg.filename;
        var _task = gulp 
          .src(cfg.source)
          .pipe(autoprefixer())
          .pipe(cleanCss())
          .pipe(gulpif(withConcat, concat(cfg.filename || 'unset.css')))
          ;
        cfg.replacement && cfg.replacement.length && cfg.replacement.map(function(r){
            _task.pipe(replace(r.regex, function(match){
                return r.handle ? r.handle.call(null, match) : (r.text || match);
            }));
        });
        _task
            .pipe(gulpif(cfg.withRev, rev()))
            .pipe(gulpif(cfg.append != '', insert.append(cfg.append)))
            .pipe(gulpif(cfg.prepend != '', insert.prepend(cfg.prepend)))
            .pipe(gulp.dest(cfg.dest))
            .pipe(gulpif(cfg.withRev, rev.manifest({
                merge: true,
                path: cfg.revFile()
            })))
            .pipe(gulpif(cfg.withRev, gulp.dest(config.manifest)));
        tasks.push(_task);
    });
    return merge(...tasks);
});

