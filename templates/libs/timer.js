(function () {
    var defaults = {
        interval: 1e3, /*每次执行的间隔时间 */
        /*回调细化，用于操作隔离 */
        progress: !1, /*进度(指每一次执行时的回调) */
        started: !1, /**当计数器开始时调用一次 */
        stoped: !1, /**当计数器停止时调用一次 */
        restarted: !1, /**当计数器被重置时调用一次 */
        /*回调细化，用于操作隔离 */
        debug: false
    };
    var timeRecorder = function (_options) {
        var time = 0, startTime = 0;
        var options = Object.assign({}, defaults, _options);
        var log = function () {
            options.debug && console.info.apply(this, arguments);
        };

        var calcTimer = null;
        var calcTime = function (interval, callback) {
            var iv = (startTime + time * interval) - new Date().getTime(); /*每次修正下次执行的时间间隔，在长时间运行的情况下，保证间隔误差范围*/
            log('next-time', iv, new Date().getTime());
            //如果时间小于等于间隔，那么
            calcTimer = setTimeout(function () {
                var now = ++time;
                calcTime(interval, callback);
                callback && callback.call(null, (now - 1), new Date().getTime());
            }, iv);
        };

        this.start = function () {
            time = 0, startTime = new Date().getTime();
            calcTime(options.interval, options.progress);
            options.started && options.started.call(null, time, new Date().getTime());
            log('timeRecorder start', startTime);
            return this;
        };

        this.stop = function () {
            clearTimeout(calcTimer);
            options.stoped && options.stoped.call(null, time, new Date().getTime());
            log('timeRecorder stop');
            return this;
        };

        this.cancle = function(){
            clearTimeout(calcTimer);
            log('timeRecorder cancel');
            return this;
        }

        this.getTime = function () {
            return time || 0;
        };
    };
    timeRecorder.countDown = function(time, callback){
        var timer = new timeRecorder({
            progress: function(_t){
                _t > time && timer.stop();
            },
            stoped: function(){
                callback && callback.call(timer);
            }
        }).start();
        return timer;
    }
    window.TimeRecorder = timeRecorder;
})();