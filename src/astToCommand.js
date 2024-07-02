export function astToCommand(ast) {
  function handleNode(node) {
    switch (node.type) {
      case "Script":
        return node.commands.map(handleNode).join("; ");
      case "Pipeline":
        return node.commands.map(handleNode).join(" | ");
      case "Command":
        return [node.name.text, ...node.suffix.map(handleNode)].join(" ");
      case "Word":
        const quoteChar = node.text.includes("'") ? '"' : "'";
        if (
          node.text.includes("\n") ||
          node.text.includes(" ") ||
          node.text.includes('"') ||
          node.text.includes("'")
        ) {
          return `${quoteChar}${node.text}${quoteChar}`;
        }
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
