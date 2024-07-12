import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, CommandNode, WordNode, RedirectNode } from "../types";

export interface CurlModuleType extends ModuleType {
  type: "curl";
  url: string;
  method: string;
  headers: string[];
  data: string;
  options: {
    silent: boolean;
    insecure: boolean;
    compressed: boolean;
    location: boolean;
  };
}

interface CurlComponentProps extends CurlModuleType {
  setUrl: (url: string) => void;
  setMethod: (method: string) => void;
  setHeaders: (headers: string[]) => void;
  setData: (data: string) => void;
  setOptions: (options: CurlModuleType['options']) => void;
}

const CurlComponent: React.FC<CurlComponentProps> = ({
  url,
  method,
  headers,
  data,
  options,
  setUrl,
  setMethod,
  setHeaders,
  setData,
  setOptions,
}) => (
  <>
    <h2 className="text-lg font-semibold mb-2">curl</h2>
    <div className="mb-2">
      <label
        htmlFor="curl-url"
        className="block text-sm font-medium text-gray-700"
      >
        URL
      </label>
      <input
        id="curl-url"
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        placeholder="Enter URL"
      />
    </div>
    <div className="mb-2">
      <label
        htmlFor="curl-method"
        className="block text-sm font-medium text-gray-700"
      >
        Method
      </label>
      <select
        id="curl-method"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
        <option value="PATCH">PATCH</option>
      </select>
    </div>
    <div className="mb-2">
      <label
        htmlFor="curl-headers"
        className="block text-sm font-medium text-gray-700"
      >
        Headers
      </label>
      <textarea
        id="curl-headers"
        value={headers.join("\n")}
        onChange={(e) => setHeaders(e.target.value.split("\n"))}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        placeholder="Enter headers (one per line)"
        rows={3}
      />
    </div>
    <div className="mb-2">
      <label
        htmlFor="curl-data"
        className="block text-sm font-medium text-gray-700"
      >
        Data
      </label>
      <textarea
        id="curl-data"
        value={data}
        onChange={(e) => setData(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        placeholder="Enter request body"
        rows={3}
      />
    </div>
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Options
      </label>
      <div className="flex flex-wrap">
        <label className="inline-flex items-center mr-4 mb-2">
          <input
            type="checkbox"
            checked={options.silent}
            onChange={(e) =>
              setOptions({ ...options, silent: e.target.checked })
            }
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="ml-2">Silent (-s)</span>
        </label>
        <label className="inline-flex items-center mr-4 mb-2">
          <input
            type="checkbox"
            checked={options.insecure}
            onChange={(e) =>
              setOptions({ ...options, insecure: e.target.checked })
            }
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="ml-2">Insecure (-k)</span>
        </label>
        <label className="inline-flex items-center mr-4 mb-2">
          <input
            type="checkbox"
            checked={options.compressed}
            onChange={(e) =>
              setOptions({ ...options, compressed: e.target.checked })
            }
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="ml-2">Compressed (--compressed)</span>
        </label>
        <label className="inline-flex items-center mr-4 mb-2">
          <input
            type="checkbox"
            checked={options.location}
            onChange={(e) =>
              setOptions({ ...options, location: e.target.checked })
            }
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="ml-2">Follow redirects (-L)</span>
        </label>
      </div>
    </div>
  </>
);

export const curlPlugin: Plugin = {
  name: "curl",
  command: "curl",
  parse: (command: CommandNode): CurlModuleType => {
    let url = "";
    let method = "GET";
    const headers: string[] = [];
    let data = "";
    const options = {
      silent: false,
      insecure: false,
      compressed: false,
      location: false,
    };

    if (command.suffix) {
      command.suffix.forEach((arg: WordNode | RedirectNode, index: number) => {
        if (arg.text?.startsWith("-")) {
          switch (arg.text) {
            case "-X":
              method = command.suffix[index + 1]?.text || "GET";
              break;
            case "-H":
              headers.push(command.suffix[index + 1]?.text || "");
              break;
            case "-d":
              data = command.suffix[index + 1]?.text || "";
              break;
            case "-s":
              options.silent = true;
              break;
            case "-k":
              options.insecure = true;
              break;
            case "--compressed":
              options.compressed = true;
              break;
            case "-L":
              options.location = true;
              break;
          }
        } else if (!arg.text?.startsWith("-")) {
          // Update this part to always set the URL to the last non-flag argument
          url = arg.text || "";
        }
      });
    }

    return {
      type: "curl",
      url,
      method,
      headers,
      data,
      options,
    };
  },
  component: CurlComponent,
  compile: (module: ModuleType): CommandNode => {
    const curlModule = module as CurlModuleType;
    const args: WordNode[] = [];

    if (curlModule.options.silent) args.push({ type: "Word", text: "-s" });
    if (curlModule.options.insecure) args.push({ type: "Word", text: "-k" });
    if (curlModule.options.compressed)
      args.push({ type: "Word", text: "--compressed" });
    if (curlModule.options.location) args.push({ type: "Word", text: "-L" });

    if (curlModule.method !== "GET") {
      args.push({ type: "Word", text: "-X" });
      args.push({ type: "Word", text: curlModule.method });
    }

    curlModule.headers.forEach((header) => {
      args.push({ type: "Word", text: "-H" });
      args.push({ type: "Word", text: `"${header}"` });
    });

    if (curlModule.data) {
      args.push({ type: "Word", text: "-d" });
      args.push({ type: "Word", text: `'${curlModule.data}'` });
    }

    args.push({ type: "Word", text: curlModule.url });

    return {
      type: "Command",
      name: { text: "curl", type: "Word" },
      suffix: args,
    };
  },
};
