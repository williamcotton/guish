[![Run Tests](https://github.com/williamcotton/guish/actions/workflows/test.yml/badge.svg)](https://github.com/williamcotton/guish/actions/workflows/test.yml)

# guish

guish (goo-ish) is a dynamic data pipeline UI that allows users to visually construct and execute complex command-line pipelines. It provides an intuitive interface for chaining together various Unix commands and custom plugins, making it easier to build and understand data processing workflows. It also features optional LLM support for updating pipelines with a natural language interface.

## Motivation

This is an exploratory project in nature, seeing how programmatic text input, natural language input and GUI input can complement each other in a novel manner.

I do a lot of data science and hop between the command line, Jupyter notebooks, R Studio, VS Code, and increasingly Claude and ChatGPT, but there's something unsatisfactory about all of them. Embedding a SQL query in another language like R puts the SQL in a secondary position. The command line keeps every language on the same level but is a rather poor interface for editing code. This application attempts to bridge these gaps.

Updates to the prompt are parsed into an AST and used to update the GUI. Updates in the GUI are used to build an AST to update the prompt. The output of each command in the pipeline is displayed in the terminal-like display below the input area. For HTML output, the rendered results are displayed in the right-hand panel.

Instead of having to write something like this into the line editor, sometimes preferable for a first approach=,

```sh
pg -d test_database -c 'SELECT * from test_table;' | tsvtocsv | ggplot 'ggplot(df, aes(as.Date(date), value)) +
    geom_col(fill = "red") +
    labs(x = "date") +
    theme_minimal()' | pngcopyhtml
```

One can write,

```sh
pg | tsvtocsv | ggplot | pngcopyhtml
```

And then fill in the blanks in the GUI with a fully fledged code editor like Monaco all while seeing the output of each step in the pipeline.

![intro-screenshot](https://github.com/user-attachments/assets/85357148-aabe-4ebb-a76b-c6287fbdcc8a)

Commands are executed as-is in a shell process. The application is merely a tool used to construct pipelines of commands.

## Features

- Visual representation of command-line pipelines
- Visible output after each command in the pipeline
- Real-time parsing of commands
- Support for custom plugins and command modules
- Bidirectional updates from CLI or GUI command modules
- Multiple output display formats:
  - Raw text output
  - JSON viewer for structured data
  - Table view for CSV/TSV data
- HTML rendering of command output
- Electron-based desktop application for cross-platform support
- Code editor integration for complex commands (e.g., SQL, AWK, R, Python, Ruby, F#)
- Keyboard shortcut (Alt+Enter) for quick command execution
- Configurable shell and preload script via `.guish` configuration file
- File operations (New, Open, Save, Save As) for pipeline scripts
- Directory selection for the `cd` command
- Copy-to-clipboard functionality for pipeline outputs
- AI-assisted command generation and updates (when OpenAI API key is configured)
- Minimizable command modules for better workspace management
- PostgreSQL schema integration for improved AI assistance with database queries
- Improved error handling and user feedback

## Live Demos

### Bidirectional Pipeline Construction

This first demo shows how pipelines can be constructed by using both the CLI and the GUI interfaces to the commands. This allows for quickly constructing a pipeline before iterating and making changes using the graphical user interface.

![guish-latest-demo](https://github.com/user-attachments/assets/2b1615df-4a11-495a-932e-2a39a246b9e8)

### LLM Instructions

This next demo shows how instructions provided to an LLM can be used to update the commands in the pipeline. This approach opens up a new space of program design where the user provides inputs that *change the code itself*. Instead of a program limited by the constraints and conditions set forth by the software developer ahead of time, the user is in control of creating an entirely new program catered to their specific needs.

![guish-llm-demo](https://github.com/user-attachments/assets/bdf1390d-bda4-4946-9ae5-3726658353b1)

## Screenshots

These screenshots were generated from the shell scripts contained in the `./demo` directory of this project.

![Screenshot 2024-07-31 at 9 18 01 AM](https://github.com/user-attachments/assets/31521871-c086-4ddc-afb7-b0c8cca408c7)
![Screenshot 2024-07-31 at 9 18 30 AM](https://github.com/user-attachments/assets/5d5485c5-2b51-49a9-bf7c-66c824ab13b0)
![Screenshot 2024-07-31 at 9 19 02 AM](https://github.com/user-attachments/assets/3cc91ca6-5f98-4f76-944d-76e9d4b6e919)
![Screenshot 2024-07-31 at 9 19 53 AM](https://github.com/user-attachments/assets/9d76fa02-e70d-474f-89eb-005a22035eeb)

## Supported GUI Command Modules

guish currently supports the following standard UNIX commands with GUI modules:

- echo
- cat
- grep
- sed
- awk
- sort
- uniq
- wc
- head
- tr
- cut
- tee
- xargs
- paste  
- jq
- curl
- node
- python
- ruby
  
As well as these custom functions and shell scripts:

- pg
- ggplot
- prependcss
- fsharp

There is also generic command support for commands that do not yet have GUI modules.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/williamcotton/guish.git
   cd guish
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Configuration

guish uses a configuration file located at `~/.guish` to customize its behavior. If this file doesn't exist, guish will use default settings.

To create or modify the configuration, create a file named `.guish` in your home directory with the following content:

```json
{
  "shell": "zsh",
  "preloadScript": "",
  "openaiApiKey": "your-api-key-here"
}
```

- `shell`: Specifies the shell to use for executing commands (default: "zsh")
- `preloadScript`: A script to run before executing each command (default: "")
- `openaiApiKey`: Your OpenAI API key for AI-assisted features (optional)

For example, if you want to source your custom functions before each command, you can set:

```json
{
  "shell": "zsh",
  "preloadScript": "source ~/.zshrc",
  "openaiApiKey": "your-api-key-here"
}
```

### Running the Application

To start the application in development mode:

```
npm start
```

This will launch the Electron app with hot-reloading enabled.

## Usage

1. Enter your command pipeline in the input area at the bottom of the screen.
2. The pipeline will be parsed and represented visually as a series of modules.
3. Modify individual command parameters using the provided UI components or in the CLI.
4. Click the "Execute" button or press Alt+Enter to run the pipeline.
5. View the output in the terminal-like display below each module.
6. For HTML output, check the right-hand panel for rendered results.
7. Use the File menu or keyboard shortcuts to create new pipelines, open existing ones, or save your work.
8. If OpenAI integration is enabled, use the input field at the top to get AI-assisted updates to your pipeline.
9. Minimize modules by clicking the chevron icon to manage your workspace more efficiently.
10. For PostgreSQL queries, the AI assistant will automatically fetch and use the database schema for improved suggestions.

## Custom Commands

These are custom shell functions and scripts that will need to be included or made available in a file referenced by the `preloadScript` section of the [`~/.guish`](#configuration) configuration in order to replicate some of the functionality seen above.

### pg

`pg` requires that `psql` is on the host system.

```sh
function pg() {
  local query=""
  local args=()
  local input_from_stdin=1  # Assume input is from stdin initially.

  # Process arguments
  while (( "$#" )); do
    if [[ "$1" == "-c" ]]; then
      if [[ -n "$2" ]]; then
        query="$2"         # Set the query from the next argument
        shift 2            # Skip the next argument as it's the query
        input_from_stdin=0 # No input from stdin since query is specified
        break
      else
        echo "Error: Expected a query after -c flag"
        return 1
      fi
    else
      args+=("$1")        # Collect other arguments
      shift
    fi
  done

  # Read query from stdin if not provided via -c
  if [[ "$input_from_stdin" -eq 1 ]]; then
    query=$(cat)
  fi

  # Execute the query with collected arguments
  psql -X -A -F $'\t' --no-align --pset footer=off "${args[@]}" -c "$query"
}
```

### ggplot

`ggplot` requires that R and [rush](https://jeroenjanssens.github.io/rush/) are on the host system.

```sh
function ggplot() {
  if [[ "$1" == "-f" ]]; then
    shift
    rush run --library tidyverse "$(cat "$1")" -
  else
    rush run --library tidyverse "$@" -
  fi
}
```

### fsharp

`fsharp` requires that `dotnet` is installed on the host system.

```bash
function fsharp() {
  # Create a temporary file with a .fsx extension
  local tmpfile=$(mktemp /tmp/temp_fsharp_script.XXXXXX.fsx)

  # Write all arguments to this temp file
  echo "$@" > $tmpfile

  # Execute the F# script using dotnet fsi
  # Redirecting stderr to /dev/null to suppress F# Interactive headers
  dotnet fsi $tmpfile 2> /dev/null

  # Remove the temporary file after execution
  rm $tmpfile
}
```

### nodejsx

`nodejsx` requires that `node`, `react` and `react-dom` are globally available on the host system.

```js
#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");

const jsxCode = process.argv[2];

// Read from stdin
const stdin = fs.readFileSync(0, "utf8");

// Create a temporary file with .jsx extension
const tmpDir = os.tmpdir();
const tmpFile = path.join(tmpDir, `nodejsx-${Date.now()}.jsx`);

try {
  // Prepend necessary imports and STDIN assignment to the JSX code
  const fullCode = `
    import React from 'react';
    import ReactDOMServer from 'react-dom/server';
    const STDIN = ${JSON.stringify(stdin)};
    ${jsxCode}
    if (typeof App !== 'undefined') {
      console.log(ReactDOMServer.renderToString(<App />));
    }
  `;

  // Write the full code to the temporary file
  fs.writeFileSync(tmpFile, fullCode);

  // Use esbuild CLI to transpile JSX to JavaScript
  const transpiledCode = execSync(
    `esbuild ${tmpFile} --format=cjs --target=node14 --bundle --external:react --external:react-dom/server`,
    {
      encoding: "utf8",
    }
  );

  // Create a context with required modules
  const context = vm.createContext({
    require,
    process,
    console,
    Buffer,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  });

  // Execute the transpiled code
  vm.runInContext(transpiledCode, context);
} finally {
  // Clean up: remove the temporary file
  fs.unlinkSync(tmpFile);
}
```

### prependcss

```bash
prependcss() {
  local html="$(cat -)"
  local css=""
  local inline_css=""

  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      -c) # Handle inline CSS
        shift # Move past the '-c' to the actual CSS content
        inline_css+="$1"
        shift # Move past the CSS content
        ;;
      *) # Handle CSS files
        if [[ -f "$1" ]]; then
          css+=$(cat "$1")
        fi
        shift # Move to the next argument
        ;;
    esac
  done

  # Combine file CSS and inline CSS
  css="$css$inline_css"

  echo "<style>$css</style>$html"
}
```

### pngcopyhtml

Tip: PNG images piped through this command will convert to HTML for display but also copy the image to system pasteboard. Opening up the Preview.app in macOS and typing `Command + V` will create a new image with the contents of the pasteboard.

```bash
pngcopyhtml() {
  tee >(pngtohtml) >(impbcopy -) > /dev/null
}
```

### pngtohtml

```python
#!/usr/bin/env python3
import base64
import sys

# Read the input bytes from stdin
png_bytes = sys.stdin.buffer.read()

# Encode the bytes as a base64 data URI
data_uri = "data:image/png;base64," + base64.b64encode(png_bytes).decode()

# Output the HTML img tag with the data URI
html = f'<img src="{data_uri}">'
sys.stdout.write(html)
```

### impbcopy

`impbcopy` requires `swift` to be installed on the host system and compiled as such:

```sh
swiftc impbcopy.swift -o impbcopy
```

```swift
// impbcopy.swift

import Cocoa

func copyToClipboard(path: String) -> Bool {
    guard let image: NSImage = {
        if path == "-" {
            let input = FileHandle.standardInput
            return NSImage(data: input.readDataToEndOfFile())
        } else {
            return NSImage(contentsOfFile: path)
        }
    }() else {
        return false
    }
    
    let pasteboard = NSPasteboard.general
    pasteboard.clearContents()
    let copiedObjects = [image]
    let copied = pasteboard.writeObjects(copiedObjects)
    return copied
}

let arguments = CommandLine.arguments
if arguments.count < 2 {
    print("""
        Usage:

        Copy file to clipboard:
            ./impbcopy path/to/file

        Copy stdin to clipboard:
            cat /path/to/file | ./impbcopy -
        """)
    exit(EXIT_FAILURE)
}

let path = arguments[1]
let success = copyToClipboard(path: path)
exit(success ? EXIT_SUCCESS : EXIT_FAILURE)
```

### tsvtohtml

```python
#!/usr/bin/env python3

import csv
import sys

def tsv_to_html():
    reader = csv.reader(sys.stdin, delimiter='\t')
    rows = list(reader)

    html = '<table>\n'
    for row in rows:
        html += '  <tr>\n'
        for cell in row:
            html += f'    <td>{cell}</td>\n'
        html += '  </tr>\n'
    html += '</table>\n'

    data = rows
    script = f'<script>const data = {data};</script>\n'
    html = script + html

    return html

if __name__ == '__main__':
    html = tsv_to_html()
    sys.stdout.write(html)
```

### tablecho

`tablecho` is currently no more than an alias for echo.

```bash
tablecho () {
        echo "$@"
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or at the very least open a detailed Issue.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- This project uses various open-source libraries and tools. We're grateful to the developers and contributors of these projects.
- Special thanks to the Electron, React, and Tailwind CSS communities for their excellent frameworks and documentation.
- Extra thanks to Claude Projects with the Artifacts plugin, ChatGPT, and GitHub Copilot Workspaces for giving me the time and energy to work on such experiments.
