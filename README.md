# guish

guish is a dynamic data pipeline UI that allows users to visually construct and execute complex command-line pipelines. It provides an intuitive interface for chaining together various Unix commands and custom plugins, making it easier to build and understand data processing workflows.

## Motivation

This is an exploratory project in nature, seeing how text input and GUI input can complement each other in a novel manner.

I do a lot of data science and hop between the command line, Jupyter notebooks, R Studio, and VS Code, but there's something unsatifactory about all of them. Embedding a SQL query in another language like R puts the SQL in a secondary position. The command line keeps every language on the same level but is a rather poor interface for writing code. This application attemps to bridge the gap.

Updates to the prompt are parsed into an AST and used to update the GUI. Updates in the GUI are used to build an AST to update the prompt.

Instead of writting something like this into the line editor,

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

And then fill in the blanks in the GUI with a fully fledged code editor like Monaco.

![Screenshot 2024-07-02 at 10 19 02 PM](https://github.com/williamcotton/guish/assets/13163/a5214e93-154b-4c5f-b727-e1d9c0e67c2a)

Commands are executed as-is in a shell process. The application is merely a tool used to construct commands and pipelines.

## Features

- Visual representation of command-line pipelines
- Real-time parsing of commands
- Support for custom plugins and command modules
- Bidirectional updates from CLI or GUI command modules
- HTML rendering of command output
- Electron-based desktop application for cross-platform support
- Code editor integration for complex commands (e.g., SQL, AWK)
- Keyboard shortcut (Alt+Enter) for quick command execution
- Configurable shell and preload script via `.guish` configuration file

## Demo

![guish-demo-lowres](https://github.com/williamcotton/guish/assets/13163/d9716a47-299c-4bd8-91a0-75615d97369d)

## Supported Commands

guish currently supports the following commands and plugins:

- echo
- cat
- grep
- sed
- awk
- pg
- ggplot
- sort
- uniq
- wc
- head
- tr
- cut
- tee
- xargs
- Generic command support for unsupported commands

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
  "preloadScript": "source ~/dotfiles/.functions"
}
```

### Running the Application

To start the application in development mode:

```
npm run electron:serve
```

This will launch the Electron app with hot-reloading enabled.

### Building the Application

To build the application for production:

```
npm run electron:build
```

This will create distributable packages for your platform in the `dist` directory.

## Usage

1. Enter your command pipeline in the input area at the bottom of the screen.
2. The pipeline will be parsed and represented visually as a series of modules.
3. Modify individual command parameters using the provided UI components or in the CLI.
4. Click the "Execute" button or press Alt+Enter to run the pipeline.
5. View the output in the terminal-like display below the input area.
6. For HTML output, check the right-hand panel for rendered results.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

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
