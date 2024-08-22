import commandLineUsage from "command-line-usage"

const helps = [{
    header: 'ddhd-cli',
    content: '一个快速生成叮当互动H5模版环境的脚手架'
},{
    header: 'options',
    optionList: [
        {
            name: 'version',
            alias: 'v',
            typeLabel: '{underline }',
            description: '版本号',
        },
        {
          name: 'help',
          alias: 'h',
          typeLabel: '{underline }',
          description: '帮助',
        }
    ]
}]


export default {
    handle: (options)=> {
        if (options.help) {
            console.log(commandLineUsage(helps));
            return true;
        }
    }
}