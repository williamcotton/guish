import {
  ASTType,
  WordNode,
  RedirectNode,
  CaseItemNode,
  ScriptNode,
  PipelineNode,
  CommandNode,
  CaseNode,
  CompoundListNode,
} from "./types";

function handleWord(node: WordNode): string {
  if (node.expansion && node.expansion.length > 0) {
    // Handle expansions
    return node.expansion.reduce((text, exp) => {
      switch (exp.type) {
        case "ArithmeticExpansion":
          return text.replace(`$((${exp.expression}))`, "");
        case "CommandExpansion":
          return text.replace(`$(${exp.command})`, "");
        case "ParameterExpansion":
          return text.replace(`${exp.parameter}`, "");
        default:
          return text;
      }
    }, node.text);
  }
  return node.text;
}

function handleRedirect(node: RedirectNode): string {
  return `${node.op}${handleWord(node.file)}`;
}

export function astToCommand(ast: ScriptNode): string {
  function handleNode(node: ASTType): string {
    switch (node.type) {
      case "Script":
        return (node as ScriptNode).commands
          ? (node as ScriptNode).commands.map(handleNode).join("; ")
          : "";
      case "Pipeline":
        return (node as PipelineNode).commands
          ? (node as PipelineNode).commands.map(handleNode).join(" | ")
          : "";
      case "LogicalExpression":
        return `${handleNode(node.left)} ${node.op} ${handleNode(node.right)}`;
      case "Command": {
        const commandNode = node as CommandNode;
        const parts: string[] = [];
        if (commandNode.prefix) {
          parts.push(...commandNode.prefix.map(handleNode));
        }
        if (commandNode.name) {
          parts.push(handleWord(commandNode.name));
        }
        if (commandNode.suffix) {
          parts.push(...commandNode.suffix.map(handleNode));
        }
        return parts.join(" ");
      }
      case "Word": {
        const quoteChar = node.text.includes("'") ? '"' : "'";
        if (
          node.text.includes("\n") ||
          node.text.includes(" ") ||
          node.text.includes('"') ||
          node.text.includes('.') ||
          node.text.includes("'")
        ) {
          return `${quoteChar}${node.text}${quoteChar}`;
        }
        return node.text;
      }
      default:
        console.warn(`Unhandled node type: ${node.type}`);
        return "";
    }
  }
  return handleNode(ast);
}
