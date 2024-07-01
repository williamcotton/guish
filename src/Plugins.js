import { genericPlugin } from "./plugins/genericPlugin.js";
import { pgPlugin } from "./plugins/pgPlugin.js";
import { grepPlugin } from "./plugins/grepPlugin.js";
import { awkPlugin } from "./plugins/awkPlugin.js";
import { sedPlugin } from "./plugins/sedPlugin.js";
import { catPlugin } from "./plugins/catPlugin.js";
import { echoPlugin } from "./plugins/echoPlugin.js";
import { ggplotPlugin } from "./plugins/ggplotPlugin.js";
import { sortPlugin } from "./plugins/sortPlugin.js";
import { uniqPlugin } from "./plugins/uniqPlugin.js";
import { wcPlugin } from "./plugins/wcPlugin.js";
import { headPlugin } from "./plugins/headPlugin.js";
import { trPlugin } from "./plugins/trPlugin.js";
import { cutPlugin } from "./plugins/cutPlugin.js";
import { teePlugin } from "./plugins/teePlugin.js";
import { xargsPlugin } from "./plugins/xargsPlugin.js";

export class Plugins {
  static plugins = {};

  static register(plugin) {
    this.plugins[plugin.command] = plugin;
  }

  static get(command) {
    return this.plugins[command];
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
Plugins.register(sortPlugin);
Plugins.register(uniqPlugin);
Plugins.register(wcPlugin);
Plugins.register(headPlugin);
Plugins.register(trPlugin);
Plugins.register(cutPlugin);
Plugins.register(teePlugin);
Plugins.register(xargsPlugin);
