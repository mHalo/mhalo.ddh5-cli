var gulp = require('gulp');

var defaults = {
    dest: './dist/',
    manifest: './manifest/'
}

var tasks = function () {
    var source = [],
        dest = '',
        append = '',
        prepend = '',
        replacement = [],
        filename = '',
        withRev = false,
        runCmd = [];
    /**
     * 输入
     * @param {*} _src 输入的文件路径字符串/集合
     * @returns
     */
    this.input = function (path) {
        if (typeof (path) === 'string') {
            source.push(path);
        }
        if (path instanceof Array) {
            source = source.concat(path);
        }
        return this;
    }
    /**
     * 输出
     * @param {*} _dest 文件路径
     * @param {*} _name 文件名（当需要进行合并操作时填写）
     * @returns
     */
    this.output = function (_dest, _name) {
        dest = _dest;
        filename = _name;
        return this;
    };
    /**
     * 输出文件头部增加代码片段
     */
    this.prepend = function (str) {
        if (typeof (str) === 'string') {
            prepend = str;
        }
        return this
    }

    this.append = function (str) {
        if (typeof (str) === 'string') {
            append = str;
        }
        return this
    }

    this.replace = function (_replace) {
        if (_replace instanceof Array) {
            replacement = _replace;
        }
        return this;
    }

    this.withRev = function () {
        withRev = true;
        return this;
    };

    this.run = function (_cmd) {
        runCmd.push(_cmd);
        return this;
    };
    /**
     * 获取当前配置的详细信息
     * @returns
     */
    this.get = function () {
        return {
            source,
            dest,
            filename,
            append,
            prepend,
            replacement,
            withRev,
            runCmd,
            revFile: function () {
                var name = filename || source[0];
                return 'rev-manifest-' + name.substring(name.lastIndexOf('/') + 1).replace('.', '-') + '.json';
            }
        };
    };
}

var config = function (_options) {
    var options = Object.assign({}, defaults, _options);
    var csslist = {},
        scriptlist = {},
        liblist = {},
        imagelist = {},
        webplist = {},
        cleanlist = {},
        revlist = {},
        copylist = {},
        movelist = {},
        runlist = {};

    var add = function (list, name, callback) {
        if (!!list[name]) {
            throw '当前配置类型中已存在名为[' + name + ']的配置';
        }
        var _tasks = new tasks(name);
        list[name] = _tasks;
        callback.call(_tasks);
    };

    this.dest = options.dest;
    this.manifest = options.manifest;

    this.addCss = function (name, callback) {
        return add(csslist, name, callback);
    };
    this.getCss = function () {
        return csslist;
    };

    this.addScript = function (name, callback) {
        return add(scriptlist, name, callback);
    };
    this.getScript = function () {
        return scriptlist;
    };

    this.addLib = function (name, callback) {
        return add(liblist, name, callback);
    };
    this.getLib = function () {
        return liblist;
    };

    this.addImage = function (name, callback) {
        return add(imagelist, name, callback);
    };
    this.getImage = function () {
        return imagelist;
    };

    this.addWebP = function (name, callback) {
        return add(webplist, name, callback);
    }
    this.getWebP = function () {
        return webplist;
    };

    this.addClean = function (name, callback) {
        return add(cleanlist, name, callback);
    };
    this.getClean = function () {
        return cleanlist;
    };

    this.addRev = function (name, callback) {
        return add(revlist, name, callback);
    };
    this.getRev = function () {
        return revlist;
    };

    this.addCopy = function (name, callback) {
        return add(copylist, name, callback);
    };
    this.getCopy = function () {
        return copylist;
    };

    this.addMove = function (name, callback) {
        return add(movelist, name, callback);
    };
    this.getMove = function () {
        return movelist;
    };

    this.runCmd = function (name, callback) {
        return add(runlist, name, callback);
    }
    this.getRun = function () {
        return runlist;
    }

    this.taskBox = function () {
        return [gulp.src('/temp/**/*').pipe(gulp.dest('./__temp/'))];
    };
}

module.exports = {
    create: function (options) {
        return new config(options);
    }
};