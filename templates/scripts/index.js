$(function () {
    /** 定义全局变量 */
    var global = {
        imgUrlPrefix: "./images/",
        audios: {
            bgMusicEle: document.getElementById("bgaudio"),
        },
    };

    PIXI.sound.add('click', "./audios/ui-click.mp3");

    var playClickAudio = () => PIXI.sound.play('click');
    const crypter = new h5crypt().setKey(['MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDN+h21pGyCnhl', 'M1jMfhQvZ3QYKCbUsd4s8RGVUGM0cBPVzw6ipa2VJyie', 'sE1J6eLvCgLp0t2iBNgthFMA3OvjhkdqGGBzDl+eRwsCOmgDSyc7JNZG1XQ4yFExZowDmHT1', '7fR87', 'Ds+54hSNFSE4kEep+TzV1iNcJcf+TJvQRQIDAQAB'].join('/'));
    const openLoginExpiredTips = () => {
        setTimeout(() => {
            layer.open({
                content: "您的登录状态已失效，请刷新后重试!",
                btn: '好的',
                shadeClose: false,
                yes: () => location.replace(window.urlPrefix)
            }); 
        }, 3e2);
    }


    ;(function(/** 接口定义 */){
        h5fx.http.defaults.timeout = 30e3;
        h5fx.http.defaults.headers["Content-Type"] = "application/json";
        h5fx.http.defaults.transformRequest =(data) => JSON.stringify(data);
        h5fx.http.defaults.headers.post["Content-Type"] = "application/json";
        window.globalInterfaces = {
            getIData: () => h5fx.http.get(window.urlPrefix + 'idata?local-debug&v=' + new Date() * 1),
        }
    })();

    ;(function(/** 定义全局信息 */){
        window.globalConfig = window.globalConfig || new function () {
            var _this = this, isReady = false, onRequesting = false, retryTimes = 0, configs = {};
            this.get = function (callback, isRefresh) {
                if (onRequesting) {
                    var nextRetryInterval = 0.3e3 + 50 * (++retryTimes);
                    setTimeout(function () {
                        console.info("[" + nextRetryInterval + "]on requesting,waiting....");
                        _this.get(callback, isRefresh);
                    }, nextRetryInterval);
                    return;
                }
                if (!isReady || isRefresh) {
                    onRequesting = true;
                    globalInterfaces.getIData().then(function (_configs) {
                        Object.assign(configs, _configs.data);
                        console.info('idata', configs);
                        isReady = true;
                        onRequesting = false;
                        callback && callback.call(null, configs);
                    }).catch(function (error) {
                        onRequesting = false;
                    });
                } else {
                    callback && callback.call(null, configs);
                }
            }
        }
    })();

    ;(function(/** 初始化数据 */){
        $('body').toggleClass('wx-ios', h5fx.device.isIos);
        window.globalConfig.get(config => {
            
        });
    })();

    ;(function(/** 背景音乐 */){
        var autoPlayBgm = h5fx.autoPlayAudio(global.audios.bgMusicEle);
        $("#bgmMusic").click(function () {
            if ($(this).hasClass('off')) {
                autoPlayBgm.start();
            } else {
                autoPlayBgm.stop();
            }
            $(this).toggleClass('off');
        });
        window.addEventListener("visibilitychange", function () {
            if (document.visibilityState == "visible") {
                $("#bgmMusic").removeClass('hide');
                !$("#bgmMusic").hasClass('off') && autoPlayBgm.start();
            } else {
                $("#bgmMusic").addClass('hide');
                !$("#bgmMusic").hasClass('off') && autoPlayBgm.stop();
            }
        });
    })();

    ;(function (/** loading */) {
        window.loaderQueue = new createjs.LoadQueue(true);
        let preloadImages = {
            'folder-name': ['file.png']
        };
        let images = Object.keys(preloadImages).reduce(function(t,c,i){
            let current = preloadImages[c]
            if(!!current && current.length){
                current.map((cur, idx) => {
                    t.push({
                        id: c + '_' + i + '_' + idx,
                        src: global.imgUrlPrefix + c + '/' + cur
                    });
                });
            }
            return t
        }, [])
        loaderQueue.on("progress", function (e) {
            var percent = Math.round((e.loaded / e.total) * 80);
            
        });
        loaderQueue.on("complete", function () {
            var loadTimer = new TimeRecorder({
                interval: 50,
                progress: function (time) {
                    if(time <= 20){
                        // progressHug.setProgress(80 + time);
                    }else{
                        // progressHug.complete();
                        loadTimer.stop();
                    }
                },
                stoped: function () {
                    setTimeout(() => {
                        $('.theme-page').removeClass('hide');
                        setTimeout(() => {
                            $(".loading-page").addClass("hide");
                        }, 5e2);
                    }, 8e2);
                }
            }).start();
        });
        loaderQueue.setMaxConnections(8);
        loaderQueue.loadManifest(images);
    })();


    const clipboardCopyText = (message) => {
        let clipboard = new ClipboardJS('.clipboard-target', {
            text: function() {
                return message;
            }
        });
        clipboard.on('success', (e)=>{
            popupToast("复制成功：" + message);
            e.clearSelection();
            clipboard.destroy();
            clipboard = null;
        });
        clipboard.on('error', (e)=>{
            popupToast("复制失败，请手动长按进行复制", 5);
            e.clearSelection();
            clipboard.destroy();
            clipboard = null;
        });
    }
    $(".clipboard-btn").click(function(evt){
        let content = $(this).attr('data-clipboard-text') || $(this).val();
        $(this).toggleClass('clipboard-target', !!content);
        if(!content) return;

        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(content).then(() => {
                popupToast("复制成功：" + content);
            }).catch(err => {
                clipboardCopyText(content)
                setTimeout(function () {
                    clipboardCopyText(content)  //如果复制失败则再次复制
                }, 200)
            })
        } else {
            clipboardCopyText(content)
            setTimeout(function () {
                clipboardCopyText(content)   //如果复制失败则再次复制
            }, 200)
        }
    })
})