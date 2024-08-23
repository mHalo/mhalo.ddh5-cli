// import entryArgsHandler from "./entry/entryArgsHandler.js";
// entryArgsHandler.register();
import pkg from './utils/package-info.js'
import updateNotifier from 'update-notifier';
import entryCmdsHandler from "./entry/entryCmdsHandler.js";

const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 });
notifier.update && notifier.notify({ isGlobal: true });


entryCmdsHandler.register();

