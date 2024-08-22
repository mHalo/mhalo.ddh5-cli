import pkg from '../../utils/package-info.js'

export default {
    handle: async (options)=> {
        if(options.version){
            console.log(`@mhalo/ddh5-cli ${pkg.version}`);
            return true;
        }
    }
}