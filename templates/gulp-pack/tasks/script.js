var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    sourcemaps = require('gulp-sourcemaps'),
    merge = require('merge-stream'), //混合多个命令 
    concat = require('gulp-concat'), //文件合并
    rename = require('gulp-rename'), //文件重命名
    rev = require('gulp-rev'), //文件版本号
    insert = require('gulp-insert'),
    replace = require('gulp-replace'),
    uglify = require('gulp-uglify'),
    removeCode = require('gulp-remove-code'),
    // 获取babel模块
    babel = require('gulp-babel');
// gzip = require('gulp-gzip'), //gzip
config = require('../config');

var gulpCfg = config.getScript();
gulp.task('script', function () {
    var tasks = config.taskBox();
    Object.keys(gulpCfg).map(function (name, index) {
        var cfg = gulpCfg[name].get();
        var withConcat = !!cfg.filename;
        var _task = gulp
            .src(cfg.source)
            .pipe(removeCode({ production: true }))
            .pipe(babel())
            .pipe(insert.prepend('/* author: corefx.ddhd */'))
            .pipe(gulpif(withConcat, concat(cfg.filename || 'unset.js')));

        cfg.replacement && cfg.replacement.length && cfg.replacement.map(function (r) {
            _task.pipe(replace(r.regex, function (match) {
                return r.handle ? r.handle.call(null, match) : (r.text || match);
            }));
        });

        _task
            .pipe(uglify({
                nameCache: {},
                compress: {
                    drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
                    collapse_vars: true, // 内嵌定义了但是只用到一次的变量
                    drop_debugger: true, //删除掉debugger语句
                    hoist_funs: true, // 提升函数声明
                    join_vars: true, // 合并连续 var 声明
                    passes: 2 //运行压缩的次数
                },
                /**输出设置 */
                output: {
                    beautify: false,
                    comments: false,
                    semicolons: true,
                    preamble: '/*author: corefx.ddhd*/'
                }
            }))
            ;
            

        _task.pipe(gulpif(cfg.withRev, rev()))
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