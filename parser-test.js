function astToCommand(ast) {
  function handleNode(node) {
    switch (node.type) {
      case "Script":
        return node.commands.map(handleNode).join("; ");
      case "Pipeline":
        return node.commands.map(handleNode).join(" | ");
      case "Command":
        return [node.name.text, ...node.suffix.map(handleNode)].join(" ");
      case "Word":
        // Preserve original quoting for all arguments
        if (node.text.startsWith('"') && node.text.endsWith('"')) {
          return node.text;
        }
        // Multi-line string
        if (node.text.includes("\n")) {
          return `"${node.text}"`;
        }
        // For other arguments, preserve quotes if they were originally present
        if (
          node.text.includes(" ") ||
          node.text.includes('"') ||
          node.text.includes("'")
        ) {
          return `"${node.text}"`;
        }
        // Default to preserving original text
        return node.text;
      case "AssignmentWord":
        return node.text;
      case "Redirect":
        const operator = node.op.text;
        const file = handleNode(node.file);
        return `${operator}${file}`;
      case "CommandExpansion":
        return `$(${handleNode(node.command)})`;
      case "ParameterExpansion":
        return `$${node.parameter}`;
      default:
        if (node.text) return node.text;
        console.warn(`Unhandled node type: ${node.type}`);
        return "";
    }
  }
  return handleNode(ast);
}

// Example usage:
import parse from "bash-parser";

let command =
  'echo "foo\nbrick\nbonk" | grep -v "foo bar" | awk "{print $1}" | sed "s/foo/bar/g"';
console.log("Original command:");
console.log(command);

let ast = parse(command);
let reconstructedCommand = astToCommand(ast);

console.log("\nReconstructed command:");
console.log(reconstructedCommand);

console.log(JSON.stringify(ast));
