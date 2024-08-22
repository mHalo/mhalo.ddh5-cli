import updateNotifier from 'update-notifier';
import pkg from '../../utils/package-info.js'

export default {
    handle: (program)=> {
        program
            .command('update')
            .description('check update')
            .option('-d, --detail [value]', 'update notifier detail', false)
            .action(async (options) => {
                const notifier = updateNotifier({ 
                    pkg,
                    updateCheckInterval: 1000 * 60 *60 /**每小时检查一次 */
                 });
                if(notifier.update){
                    notifier.notify()
                }
                if(options.detail){
                    console.info('update-notifier', JSON.stringify(notifier, null, 2))
                }
            })
    }
}