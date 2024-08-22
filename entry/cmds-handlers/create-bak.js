import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import chalk from 'chalk';
import { input, confirm, select, checkbox, number, Separator  } from '@inquirer/prompts';
import { exit } from 'process';
import ejs from 'ejs'
import { Hash } from 'crypto';

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
            console.info(src, dest)
            // ejs.renderFile(src, data, (err, str) => {
            //     if (err) throw err;
            //     fs.writeFileSync(dest, str);
            // });
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
                            value: {
                                css: [
                                    { href: 'libs/h5fx/h5fx.css' }
                                ],
                                js: [
                                    { src: 'libs/h5fx/h5fx.js' }
                                ]
                            },
                            checked: true,
                            description: 'H5通用类库'
                        },
                        {
                            name: 'wxjssdk',
                            value: {
                                js: [ 
                                    { src: 'https://res2.wx.qq.com/open/js/jweixin-1.6.0.js' } 
                                ]
                            },
                            checked: true,
                            description: '微信jssdk'
                        },
                        {
                            name: 'layer-mobile',
                            value: {
                                css: [
                                    { href: 'libs/layer-mobile/layer-mobile.css' }
                                ],
                                js: [
                                    { src: 'libs/layer-mobile/layer-mobile.js' }
                                ]
                            },
                            checked: true,
                            description: '轻量toast类库'
                        },
                        {
                            name: 'stalker',
                            value: {
                                js: [{
                                    src: 'https://open.iddhd.com/scripts/stalker.min.js',
                                    endpoint: 'https://open.iddhd.com/stalker/tail'
                                }]
                            },
                            checked: true,
                            description: '通用数据统计类库'
                        },
                        {
                            name: 'lucky-draw',
                            value: {
                                js: [ 
                                    { src: 'libs/lucky-draw.js' }
                                ]
                            },
                            description: '抽奖组件类库'
                        },
                        {
                            name: 'pixi',
                            value: {
                                js: [ 
                                    { src: 'libs/pixi/pixi.min-v7.js' },
                                    { src: 'libs/pixi/pixi.sound-v7.js' }
                                ]
                            },
                            description: '2D引擎Pixi'
                        },
                        {
                            name: 'html2canvas',
                            value: {
                                js: [ 
                                    { src: 'libs/html2canvas.1.4.1.js' }
                                ]
                            },
                            description: '海报生成类库'
                        },
                        {
                            name: 'clipboard',
                            value: {
                                js: [ 
                                    { src: 'libs/clipboard.min.js' }
                                ]
                            },
                            description: '复制模块'
                        },
                        {
                            name: 'jsencrypt',
                            value: {
                                js: [ 
                                    { src: 'libs/jsencrypt.min.js' }
                                ]
                            },
                            description: '前端加密模块'
                        }
                    ]
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
                }else{
                    console.log(chalk.green(`📢📢📢  预览将使用以下端口：
运行端口：${chalk.red.underline.bold(port)} 
热更新端口：${chalk.red.underline.bold(port * 1 + 1)}`));
                }

                const templateData = { appType, libs: {
                    css: Array.from(libs.filter(s => s.css).reduce((t,c) => { c.css.map(x => t.add(renderElementTag('link', x))); return t; }, new Set())),
                    js: Array.from(libs.filter(s => s.js).reduce((t,c) => { c.js.map(x => t.add(renderElementTag('script', x))); return t; }, new Set()))
                }, port };
                console.info(JSON.stringify(templateData, null, 2))
                checkWorkingDir(name).then(destDir => createFiles(templateDir, destDir, templateData))
            })
    }
}