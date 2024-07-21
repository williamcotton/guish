[![Run Tests](https://github.com/williamcotton/guish/actions/workflows/test.yml/badge.svg)](https://github.com/williamcotton/guish/actions/workflows/test.yml)

# guish

guish (goo-ish) is a dynamic data pipeline UI that allows users to visually construct and execute complex command-line pipelines. It provides an intuitive interface for chaining together various Unix commands and custom plugins, making it easier to build and understand data processing workflows.

## Motivation

This is an exploratory project in nature, seeing how text input and GUI input can complement each other in a novel manner.

I do a lot of data science and hop between the command line, Jupyter notebooks, R Studio, and VS Code, but there's something unsatisfactory about all of them. Embedding a SQL query in another language like R puts the SQL in a secondary position. The command line keeps every language on the same level but is a rather poor interface for writing code. This application attempts to bridge the gap.

Updates to the prompt are parsed into an AST and used to update the GUI. Updates in the GUI are used to build an AST to update the prompt. The output of each command in the pipeline is displayed in the terminal-like display below the input area. For HTML output, the rendered results are displayed in the right-hand panel.

Instead of having to write something like this into the line editor, sometimes preferable for a first approach

```sh
pg -d test_database -c 'SELECT * from test_table;' | tsvtocsv | ggplot 'ggplot(df, aes(as.Date(date), value)) +
    geom_col(fill = "red") +
    labs(x = "date") +
    theme_minimal()' | pngtohtml
```

One can write,

```sh
pg | tsvtocsv | ggplot | pngtohtml
```

And then fill in the blanks in the GUI with a fully fledged code editor like Monaco all while seeing the output of each step in the pipeline.

<img width="1440" alt="Screenshot 2024-07-21 at 6 03 24 AM" src="https://github.com/user-attachments/assets/3a6af857-1e16-4a82-ab26-4a536b763e40">

Commands are executed as-is in a shell process. The application is merely a tool used to construct commands and pipelines.

## Features

- Visual representation of command-line pipelines
- Visible output after each command in the pipeline
- Real-time parsing of commands
- Support for custom plugins and command modules
- Bidirectional updates from CLI or GUI command modules
- HTML rendering of command output
- Electron-based desktop application for cross-platform support
- Code editor integration for complex commands (e.g., SQL, AWK, R)
- Keyboard shortcut (Alt+Enter) for quick command execution
- Configurable shell and preload script via `.guish` configuration file
- File operations (New, Open, Save, Save As) for pipeline scripts
- Directory selection for the `cd` command

## Demo

![guish-latest-demo-lowres](https://github.com/user-attachments/assets/b000d05f-39f6-46fb-ab1f-4ba033855175)


## Supported Commands

guish currently supports the following commands and plugins:

- echo
- cat
- grep
- sed
- awk
- pg (PostgreSQL)
- ggplot
- sort
- uniq
- wc
- head
- tr
- cut
- tee
- xargs
- prependcss
- cd
- jq (JSON processing)
- curl (HTTP requests)
- node (JavaScript execution)
- python (Python script execution)
- ruby (Ruby script execution)
- paste
- Generic command support for unsupported commands

### pg and ggplot

These are both custom shell functions that will need to be included in a file referenced by the `preloadScript` section of the [`~/.guish`](#configuration) configuration.

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
  "preloadScript": ""
}
```

- `shell`: Specifies the shell to use for executing commands (default: "zsh")
- `preloadScript`: A script to run before executing each command (default: "")

For example, if you want to source your custom functions before each command, you can set:

```json
{
  "shell": "zsh",
  "preloadScript": "source ~/.zshrc"
}
```

### Running the Application

To start the application in development mode:

```
npm start
```

This will launch the Electron app with hot-reloading enabled.

### Building the Application

To build the application for production:

```
npm run make
```

This will create distributable packages for your platform in the `dist` directory.

## Usage

1. Enter your command pipeline in the input area at the bottom of the screen.
2. The pipeline will be parsed and represented visually as a series of modules.
3. Modify individual command parameters using the provided UI components or in the CLI.
4. Click the "Execute" button or press Alt+Enter to run the pipeline.
5. View the output in the terminal-like display below the input area.
6. For HTML output, check the right-hand panel for rendered results.
7. Use the File menu or keyboard shortcuts to create new pipelines, open existing ones, or save your work.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or at the very least open a detail Issue.

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
- Extra thanks to Claude Projects with the Artifacts plugin for giving me the time and energy to work on such experiements.
