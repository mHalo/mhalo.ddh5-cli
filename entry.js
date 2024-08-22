// import entryArgsHandler from "./entry/entryArgsHandler.js";
// entryArgsHandler.register();
import pkg from './utils/package-info.js'
import updateNotifier from 'update-notifier';
import entryCmdsHandler from "./entry/entryCmdsHandler.js";

entryCmdsHandler.register();

const notifier = updateNotifier({ pkg });
if (notifier.update) {
    notifier.notify();
}