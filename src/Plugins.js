import { genericPlugin } from "./plugins/genericPlugin.js";
import { pgPlugin } from "./plugins/pgPlugin.js";
import { grepPlugin } from "./plugins/grepPlugin.js";
import { awkPlugin } from "./plugins/awkPlugin.js";
import { sedPlugin } from "./plugins/sedPlugin.js";
import { catPlugin } from "./plugins/catPlugin.js";
import { echoPlugin } from "./plugins/echoPlugin.js";
import { ggplotPlugin } from "./plugins/ggplotPlugin.js";

export class Plugins {
  static plugins = {};

  static register(plugin) {
    this.plugins[plugin.command] = plugin;
  }

  static get(command) {
    return this.plugins[command];
  }

  static getAll() {
    return Object.values(this.plugins);
  }
}

// Register plugins
Plugins.register(genericPlugin);
Plugins.register(pgPlugin);
Plugins.register(grepPlugin);
Plugins.register(awkPlugin);
Plugins.register(sedPlugin);
Plugins.register(catPlugin);
Plugins.register(echoPlugin);
Plugins.register(ggplotPlugin);
