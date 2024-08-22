var gulp = require('gulp'),
  gulpif = require('gulp-if'),
  merge = require('merge-stream'), //混合多个命令 
  revCollector = require('gulp-rev-collector'),
  minifyHTML = require('gulp-htmlmin'),
  rename = require('gulp-rename'), //文件重命名
  replace = require('gulp-replace'),
  removeCode = require('gulp-remove-code'),
  insert = require('gulp-insert');

var config = require('../config'),
  revCfg = config.getRev(),
  cssCfg = config.getCss(),
  scriptCfg = config.getScript();

var replacement = function (match, src, mainConfig) {
  var cfgs = Object.keys(mainConfig).map(function (name) {
    return mainConfig[name].get();
  });
  var result = match;
  for (var i = 0; i < cfgs.length; i++) {
    var cfg = cfgs[i];
    var withConcat = !!cfg.filename;
    if (withConcat) { //如果有合并
      var idx = cfg.source.indexOf(src);
      idx > -1 && ~(function () {
        if (idx == cfg.source.length - 1) {
          result = match.replace(src, cfg.dest.replace(config.dest, './')
            + (cfg.dest.substr(cfg.dest.length - 1) == "/" ? "" : "/")
            + cfg.filename);
        } else {
          result = '';
        }
      })();
    }
    if (result != match) break;
  }
  return result;
};
gulp.task('rev', function () {
  var tasks = config.taskBox();
  Object.keys(revCfg).map(function (name) {
    var cfg = revCfg[name].get();
    var _task = gulp.src([config.manifest + '**/*.json', cfg.source[0]])
      .pipe(replace(/(<script[\bsrc\s?=\s?]\bsrc\s?=\s?([^>]*)>([^<\/script>]*)<\/script>)/ig, function (match) {
        var src = match.match(/<script .*?src=\"(.+?)\"/)[1];
        return replacement(match, src, scriptCfg);
      }))
      .pipe(replace(/(<link.*\s+href=(?:"[^"]*"|'[^']*')[^<]*>)/ig, function (match) {
        var src = match.match(/<link .*?href=\"(.+?)\"/)[1];
        return replacement(match, src, cssCfg);
      }))
      .pipe(replace(/\r\n\r\n/ig, function (match) {
        return '\n';
      }))
      ;

    cfg.replacement && cfg.replacement.length && cfg.replacement.map(function (r) {
      _task.pipe(replace(r.regex, function (match) {
        return r.handle ? r.handle.call(null, match) : (r.text || match);
      }));
    });

    _task
      //.pipe(header(cfg.headerHtml))
      .pipe(removeCode({ production: true }))
      .pipe(revCollector({
        replaceReved: true
      }))
      .pipe(minifyHTML({
        collapseWhitespace: true,
        removeComments: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        html5: true,
        processScripts:[ 'text/javascript' ],
        minifyJS: {
          /**是否完全压缩 */
          compress: true,
          /**输出设置 */
          output: {
            beautify: false,
            comments: false,
            semicolons: true,
            preamble: '/*author: MHalo at ddhd*/'
          }
        },
        minifyCSS: true
      }))
      .pipe(gulpif(cfg.append != '', insert.append(cfg.append)))
      .pipe(gulpif(cfg.prepend != '', insert.prepend(cfg.prepend)))
      .pipe(rename(cfg.filename))
      .pipe(gulp.dest(cfg.dest));
    tasks.push(_task);
  });
  return merge(...tasks);
});