# guish

guish is a dynamic data pipeline UI that allows users to visually construct and execute complex command-line pipelines. It provides an intuitive interface for chaining together various Unix commands and custom plugins, making it easier to build and understand data processing workflows.

## Features

- Visual representation of command-line pipelines
- Real-time parsing of commands
- Support for custom plugins and command modules
- Bidirectional updates from CLI or GUI command modules
- HTML rendering of command output
- Electron-based desktop application for cross-platform support

## Screenshots

![Screenshot 2024-06-30 at 8 30 57 PM](https://github.com/williamcotton/guish/assets/13163/dd4ac407-aa77-4954-84e9-1b8c05874d56)
![Screenshot 2024-06-30 at 8 32 33 PM](https://github.com/williamcotton/guish/assets/13163/6f36c384-34c3-49ca-ad80-bdfbb0c7e480)


## Supported Commands

guish currently supports the following commands and plugins:

- echo
- cat
- grep
- sed
- awk
- PostgreSQL queries (pg)
- ggplot (for data visualization)
- Generic command support for unsupported commands

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/guish.git
   cd guish
   ```

2. Install dependencies:
   ```
   npm install
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
4. Click the "Execute" button or press Ctrl+Enter (Cmd+Enter on macOS) to run the pipeline.
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

This project is licensed under the ISC License. See the `LICENSE` file for details.

## Acknowledgments

- This project uses various open-source libraries and tools. We're grateful to the developers and contributors of these projects.
- Special thanks to the Electron, React, and Tailwind CSS communities for their excellent frameworks and documentation.
Write shell pipelines with bidirectional GUI modules.
