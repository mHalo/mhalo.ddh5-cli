import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import chalk from 'chalk';
import { input, confirm, select, checkbox, number, Separator  } from '@inquirer/prompts';
import { exit } from 'process';
import ejs from 'ejs'
import spawn from 'cross-spawn';

// 获取当前模块的完整路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件夹的完整路径
const __dirname = path.dirname(__filename);
const templateDir = path.resolve(__dirname, '../../templates');

const checkWorkingDir = (name) => new Promise((resolve, reject) => {
    if(!!name){
        fs.mkdir(name.trim(), { recursive: true }, (err) => {
            if(!!err){
                reject(err)
            }else{
                resolve(path.join(process.cwd(), name))
            }
        })
    }else{
        resolve(process.cwd())
    }
});
const createFiles = (src, dest, data) => {
    const stats = fs.statSync(src);
    if (stats.isDirectory()){
        fs.mkdirSync(dest, { recursive: true });
        const files = fs.readdirSync(src);
        files.forEach(file => {
            createFiles(path.join(src, file), path.join(dest, file), data);
        });
    }else{
        const fileName = path.basename(src);
        const fileExtension = path.extname(src);
        if(fileExtension == '.ejs'){
            dest = dest.substr(0, dest.lastIndexOf(".ejs"))
            ejs.renderFile(src, data, (err, str) => {
                if (err) throw err;
                fs.writeFileSync(dest, str);
            });
        }else{
            fs.copyFileSync(src, dest);
        }
    }    
}
const handlePromptsError = (error) => {
    error.name === 'ExitPromptError' && exit(0)
}
const renderElementTag = (tag, attrObj) => {
    var render = ''
    switch(tag){
        case 'link':
            render = `<link rel="stylesheet" ${ Object.keys(attrObj).map(k => `"${k}"="${attrObj[k]}"`).join(' ') } />`
            break;
        case 'script':
            render = `<script ${ Object.keys(attrObj).map(k => `"${k}"="${attrObj[k]}"`).join(' ') }></script>`
            break;
        default:
            render = ''
            break;
    }
    return render;
}

export default {
    handle: (program)=> {
        program
            .command('create [app-name]')
            .description('create app files from template')
            .action(async (name, options) => {
                if(!name){
                    const ensure = await confirm({ 
                        message: `确认在当前目录[${chalk.yellow.underline.bold(process.cwd())}]下创建项目?` 
                    }).catch((error)=>{ handlePromptsError(error); });
                    if(!ensure){
                        return;
                    }
                }

                //模版类型
                const appType = await select({
                    message: '选择一个项目模版',
                    choices: [
                        {
                            name: 'html',
                            value: 'html',
                            description: '仅作为静态页面项目',
                        },
                        {
                            name: 'cshtml',
                            value: 'cshtml',
                            description: '作为C#视图页面项目',
                        }
                    ]
                }).catch((error)=>{ handlePromptsError(error); })
                //适用类库
                const libs = await checkbox({
                    message: '选择项目要使用的类库',
                    pageSize: 10,
                    choices: [
                        {
                            name: 'h5fx',
                            value: 'h5fx',
                            checked: true,
                            description: 'H5通用类库'
                        },
                        {
                            name: 'layer-mobile',
                            value: 'layer-mobile',
                            checked: true,
                            description: '轻量toast类库'
                        },
                        {
                            name: 'wxjssdk',
                            value: 'wxjssdk',
                            description: '微信jssdk'
                        },
                        {
                            name: 'stalker',
                            value: 'stalker',
                            description: '通用数据统计类库'
                        },
                        {
                            name: 'lucky-draw',
                            value: 'lucky-draw',
                            description: '抽奖组件类库'
                        },
                        {
                            name: 'pixi-v7',
                            value: 'pixi-v7',
                            description: '2D引擎Pixi'
                        },
                        {
                            name: 'pixi-v8',
                            value: 'pixi-v8',
                            description: '2D引擎Pixi'
                        },
                        {
                            name: 'phaser',
                            value: 'phaser',
                            description: '2D引擎phaser'
                        },
                        {
                            name: 'phaser-lite',
                            value: 'phaser-lite',
                            description: '2D引擎phaser'
                        },
                        {
                            name: 'html2canvas',
                            value: 'html2canvas',
                            description: '海报生成类库'
                        },
                        {
                            name: 'clipboard',
                            value: 'clipboard',
                            description: '复制模块'
                        },
                        {
                            name: 'jsencrypt',
                            value: 'jsencrypt',
                            description: '前端加密模块'
                        }
                    ]
                }).catch((error)=>{ handlePromptsError(error); });
                //页面名称
                const title = await input({ 
                    message: '页面名称',
                    default: name || path.basename(process.cwd())
                }).catch((error)=>{ handlePromptsError(error); });
                //运行端口
                const port = await input({ 
                    message: '预览端口(默认使用1235&1236端口)',
                    default: '1235'
                }).catch((error)=>{ handlePromptsError(error); });
                if(!port || port * 1 != port){
                    console.log()
                    console.error(chalk.red(`❌❌❌ 预览端口[${port}]不是合法的端口号`));
                    console.log()
                    return;
                }
                //代理后端端口
                const backPort = await input({ 
                    message: '后端代理端口(默认使用5001端口)',
                    default: '5001'
                }).catch((error)=>{ handlePromptsError(error); });
                if(!backPort || backPort * 1 != backPort){
                    console.log()
                    console.error(chalk.red(`❌❌❌ 后端代理端口[${backPort}]不是合法的端口号`));
                    console.log()
                    return;
                }
                
                console.log(chalk.green(`📢📢📢  预览将使用以下端口：
运行端口：${chalk.red.underline.bold(port)} 
热更新端口：${chalk.red.underline.bold(port * 1 + 1)}
后端代理端口：${chalk.red.underline.bold(backPort)}`));

                const templateData = { appType, title, libs, ports:{ run: port, livereload: (port*1) + 1, backProxy: backPort  } };
                // console.info(JSON.stringify(templateData, null, 2))
                checkWorkingDir(name).then(async destDir => {
                    createFiles(templateDir, destDir, templateData);

                    const ensure = await select({
                        message:  `是否安装依赖包（执行pnpm i）?\r\n${ chalk.yellowBright(`项目目录：[${destDir}]`) }\r\n` ,
                        choices: [
                            {
                                name: '稍后自行手动安装',
                                value: false,
                            },
                            {
                                name: '立即安装依赖包',
                                value: true,
                            }                            
                        ]
                    }).catch((error)=>{ handlePromptsError(error); })

                    if(ensure){
                        const installPkg = spawn('pnpm', ['i', '--prefer-offline', '--no-frozen-lockfile', '--dir', destDir], { stdio: 'inherit' });
                        installPkg.on('close', (code) => {
                            console.log();
                            console.log('🎈 🎈 🎈 🎈 🎈 🎈 🎈 🎈 🎈');
                            console.log(chalk.bgHex('#ff8787')(`　　　　　　　　　　　　　`));
                            console.log(chalk.bgHex('#ff8787').hex('#f8f9fa').bold(`     依赖包安装完成！     `));
                            console.log(chalk.bgHex('#ff8787')(`　　　　　　　　　　　　　`));
                            console.log('🎈 🎈 🎈 🎈 🎈 🎈 🎈 🎈 🎈');
                            console.log();
                        });
                    }
                })
            })
    }
}