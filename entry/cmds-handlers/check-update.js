import updateNotifier from 'update-notifier';
import pkg from '../../utils/package-info.js'

export default {
    handle: (program)=> {
        program
            .command('update')
            .description('check update')
            .option('-d, --detail [value]', 'update notifier detail', false)
            .option('-f, --fetch [value]', 'fetch npmjs.registry result', false)
            .action((options) => {
                const notifier = updateNotifier({ 
                    pkg,
                    updateCheckInterval: 1000 * 60 * 60 /**每小时检查一次 */
                });

                if(notifier.update){
                    notifier.notify({ isGlobal: true })
                }
                if(options.detail){
                    console.info('update-notifier', JSON.stringify(notifier, null, 2))
                }
                if(options.fetch){
                    notifier.fetchInfo().then(res => {
                        console.info('update-notifier-fetch', res);
                    });
                }
            })
    }
}


/**
# 查看自己的安装源
npm config get registry
 
# 更换npm源为国内淘宝镜像
npm config set registry http://registry.npm.taobao.org/
 
# 或者国内npm官方镜像
npm config set registry http://registry.cnpmjs.org/
 
# ----- 还原npm源 ------
npm config set registry https://registry.npmjs.org/

 */