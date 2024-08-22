import { Command } from 'commander'
import pkg from '../utils/package-info.js'
import create from './cmds-handlers/create.js'

const program = new Command();

const handlers = {
    create
}

program
    .version(`@mhalo/ddh5-cli ${pkg.version}`, '-v, --vers')
    .usage('<command> [options]', '-h --help');

export default {
    register: () => {
        Object.keys(handlers).forEach(key => {
            let handled = handlers[key].handle(program);
            return !handled;
        });
        program.parse(process.argv)
    }
}