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
      case "LogicalExpression": {
        const op = node.op === ";" ? `${node.op} ` : ` ${node.op} `;
        return `${handleNode(node.left)}${op}${handleNode(node.right)}`;
      }
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
      case "Function":
        return `${node.name.text}() { ${handleNode(node.body)}; }`;
      case "CompoundList": {
        const compoundListNode = node as CompoundListNode;
        return compoundListNode.commands
          ? compoundListNode.commands.map(handleNode).join("; ")
          : "";
      }
      case "Subshell":
        return `(${handleNode(node.list)})`;
      case "For":
        return `for ${node.name.text} in ${node.wordlist
          .map(handleWord)
          .join(" ")}; do ${handleNode(node.do)}; done`;
      case "Case": {
        const caseNode = node as CaseNode;
        const cases = caseNode.cases
          .map((caseItem: CaseItemNode) => {
            return `${caseItem.pattern.map(handleWord).join("|")}) ${handleNode(
              caseItem.body
            )};;`;
          })
          .join("\n");
        return `case ${handleWord(caseNode.clause)} in\n${cases}\nesac`;
      }
      case "If": {
        let ifString = `if ${handleNode(node.clause)}; then ${handleNode(
          node.then
        )}`;
        if (node.else) {
          ifString += `; else ${handleNode(node.else)}`;
        }
        return `${ifString}; fi`;
      }
      case "While":
        return `while ${handleNode(node.clause)}; do ${handleNode(
          node.do
        )}; done`;
      case "Until":
        return `until ${handleNode(node.clause)}; do ${handleNode(
          node.do
        )}; done`;
      case "Word": {
        let quoteChar;
        if ("quoteChar" in node) {
          quoteChar = node.quoteChar;
        } else {
          quoteChar = node.text.includes("'") ? '"' : "'";
        }
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
      case "AssignmentWord":
        return (node as WordNode).text;
      case "Redirect":
        return handleRedirect(node as RedirectNode);
      default:
        console.warn(`Unhandled node type: ${node.type}`);
        return "";
    }
  }
  return handleNode(ast);
}
