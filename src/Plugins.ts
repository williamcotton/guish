import { ModuleType, CommandNode } from "./types";

// Import all plugin types
import { genericPlugin } from "./plugins/genericPlugin";
import { pgPlugin } from "./plugins/pgPlugin";
import { grepPlugin } from "./plugins/grepPlugin";
import { awkPlugin } from "./plugins/awkPlugin";
import { sedPlugin } from "./plugins/sedPlugin";
import { catPlugin } from "./plugins/catPlugin";
import { echoPlugin } from "./plugins/echoPlugin";
import { ggplotPlugin } from "./plugins/ggplotPlugin";
import { sortPlugin } from "./plugins/sortPlugin";
import { uniqPlugin } from "./plugins/uniqPlugin";
import { wcPlugin } from "./plugins/wcPlugin";
import { headPlugin } from "./plugins/headPlugin";
import { trPlugin } from "./plugins/trPlugin";
import { cutPlugin } from "./plugins/cutPlugin";
import { teePlugin } from "./plugins/teePlugin";
import { xargsPlugin } from "./plugins/xargsPlugin";
import { prependcssPlugin } from "./plugins/prependcssPlugin";
import { cdPlugin } from "./plugins/cdPlugin";
import { jqPlugin } from "./plugins/jqPlugin";
import { curlPlugin } from "./plugins/curlPlugin";
import { nodePlugin } from "./plugins/nodePlugin";
import { pythonPlugin } from "./plugins/pythonPlugin";
import { rubyPlugin } from "./plugins/rubyPlugin";
import { pastePlugin } from "./plugins/pastePlugin";
import { fsharpPlugin } from "./plugins/fsharpPlugin";
import { tablechoPlugin } from "./plugins/tablechoPlugin";
import { nodejsxPlugin } from "./plugins/nodejsxPlugin";


// Define the Plugin interface
export interface Plugin {
  name: string;
  command: string;
  parse: (command: CommandNode) => ModuleType;
  component: React.FC<any>; // eslint-disable-line
  compile: (module: ModuleType) => CommandNode;
  containerClasses?: string;
  quoteChar?: string;
}

export class Plugins {
  private static plugins: { [key: string]: Plugin } = {};

  static register(plugin: Plugin): void {
    this.plugins[plugin.command] = plugin;
  }

  static get(command: string): Plugin | undefined {
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
Plugins.register(prependcssPlugin);
Plugins.register(cdPlugin);
Plugins.register(jqPlugin);
Plugins.register(curlPlugin);
Plugins.register(nodePlugin);
Plugins.register(pythonPlugin);
Plugins.register(rubyPlugin);
Plugins.register(pastePlugin);
Plugins.register(fsharpPlugin);
Plugins.register(tablechoPlugin);
Plugins.register(nodejsxPlugin);
