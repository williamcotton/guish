export interface ModuleType {
  type: string;
  [key: string]: any; // eslint-disable-line
}

export interface EnhancedModuleType extends ModuleType {
  operator?: "and" | "pipe";
}

export interface ASTType {
  type: string;
  commands?: ASTType[];
  [key: string]: any; // eslint-disable-line
}

export interface ScriptNode extends ASTType {
  type: "Script";
  commands: Array<
    | LogicalExpressionNode
    | PipelineNode
    | CommandNode
    | FunctionNode
    | SubshellNode
    | ForNode
    | CaseNode
    | IfNode
    | WhileNode
    | UntilNode
  >;
}

export interface PipelineNode extends ASTType {
  type: "Pipeline";
  commands: Array<
    | CommandNode
    | FunctionNode
    | SubshellNode
    | ForNode
    | CaseNode
    | IfNode
    | WhileNode
    | UntilNode
  >;
}

export interface LogicalExpressionNode extends ASTType {
  type: "LogicalExpression";
  op: string;
  left:
    | LogicalExpressionNode
    | PipelineNode
    | CommandNode
    | FunctionNode
    | SubshellNode
    | ForNode
    | CaseNode
    | IfNode
    | WhileNode
    | UntilNode;
  right:
    | LogicalExpressionNode
    | PipelineNode
    | CommandNode
    | FunctionNode
    | SubshellNode
    | ForNode
    | CaseNode
    | IfNode
    | WhileNode
    | UntilNode;
}

export interface CommandNode extends ASTType {
  type: "Command";
  name: WordNode;
  prefix?: Array<AssignmentWordNode | RedirectNode>;
  suffix: Array<WordNode | RedirectNode>;
}

export interface FunctionNode extends ASTType {
  type: "Function";
  name: NameNode;
  redirections: Array<RedirectNode>;
  body: CompoundListNode;
}

export interface NameNode extends ASTType {
  type: "Name";
  text: string;
}

export interface CompoundListNode extends ASTType {
  type: "CompoundList";
  commands: Array<
    | LogicalExpressionNode
    | PipelineNode
    | CommandNode
    | FunctionNode
    | SubshellNode
    | ForNode
    | CaseNode
    | IfNode
    | WhileNode
    | UntilNode
  >;
  redirections: Array<RedirectNode>;
}

export interface SubshellNode extends ASTType {
  type: "Subshell";
  list: CompoundListNode;
}

export interface ForNode extends ASTType {
  type: "For";
  name: NameNode;
  wordlist: Array<WordNode>;
  do: CompoundListNode;
}

export interface CaseNode extends ASTType {
  type: "Case";
  clause: WordNode;
  cases: Array<CaseItemNode>;
}

export interface CaseItemNode extends ASTType {
  type: "CaseItem";
  pattern: Array<WordNode>;
  body: CompoundListNode;
}

export interface IfNode extends ASTType {
  type: "If";
  clause: CompoundListNode;
  then: CompoundListNode;
  else?: CompoundListNode;
}

export interface WhileNode extends ASTType {
  type: "While";
  clause: CompoundListNode;
  do: CompoundListNode;
}

export interface UntilNode extends ASTType {
  type: "Until";
  clause: CompoundListNode;
  do: CompoundListNode;
}

export interface RedirectNode extends ASTType {
  type: "Redirect";
  op: string;
  file: WordNode;
  numberIo?: number;
}

export interface WordNode extends ASTType {
  type: "Word";
  text: string;
  expansion?: Array<
    ArithmeticExpansionNode | CommandExpansionNode | ParameterExpansionNode
  >;
}

export interface AssignmentWordNode extends ASTType {
  type: "AssignmentWord";
  text: string;
  expansion?: Array<
    ArithmeticExpansionNode | CommandExpansionNode | ParameterExpansionNode
  >;
}

export interface ArithmeticExpansionNode extends ASTType {
  type: "ArithmeticExpansion";
  expression: string;
  resolved: boolean;
  arithmeticAST: object;
  loc: {
    start: number;
    end: number;
  };
}

export interface CommandExpansionNode extends ASTType {
  type: "CommandExpansion";
  command: string;
  resolved: boolean;
  commandAST: object;
  loc: {
    start: number;
    end: number;
  };
}

export interface ParameterExpansionNode extends ASTType {
  type: "ParameterExpansion";
  parameter: string;
  kind?: string;
  word?: string;
  op?: string;
  loc: {
    start: number;
    end: number;
  };
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  message?: string;
}

export interface SaveDialogReturnValue {
  canceled: boolean;
  filePath?: string;
}

export type ValidChannels =
  | "execute-command"
  | "parse-command"
  | "fromMain"
  | "parse-command-result"
  | "execute-command-result"
  | "new-pipeline"
  | "open-pipeline"
  | "save-pipeline"
  | "save-pipeline-as";

export interface ElectronAPI {
  showSaveScriptDialog: (
    options: Electron.SaveDialogOptions
  ) => Promise<SaveScriptDialogResult>;
  showOpenScriptDialog: (
    options: Electron.SaveDialogOptions
  ) => Promise<OpenScriptDialogResult>;
  showDirectoryDialog: (
    options: OpenDialogOptions
  ) => Promise<OpenDialogReturnValue>;
  saveScriptFile: (
    content: string,
    filePath: string
  ) => Promise<SaveScriptFileResult>;
  openScriptFile: (filePath: string) => Promise<OpenScriptFileResult>;
  executeCommand: (command: string) => void;
  parseCommand: (command: string) => void;
  showSaveDialog: (
    options: SaveDialogOptions
  ) => Promise<SaveDialogReturnValue>;
  ipcRenderer: {
    send: (channel: ValidChannels, data: unknown) => void;
    receive: (
      channel: ValidChannels,
      func: (...args: unknown[]) => void
    ) => void;
    removeAllListeners: (channel: ValidChannels) => void;
  };
}

export interface SaveScriptDialogResult {
  canceled: boolean;
  filePath?: string;
}

export interface OpenScriptDialogResult {
  canceled: boolean;
  filePaths: string[];
}

export interface OpenDialogReturnValue {
  canceled: boolean;
  filePaths: string[];
}

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: Array<
    | "openFile"
    | "openDirectory"
    | "multiSelections"
    | "showHiddenFiles"
    | "createDirectory"
    | "promptToCreate"
    | "noResolveAliases"
    | "treatPackageAsDirectory"
    | "dontAddToRecent"
  >;
  message?: string;
}


export interface SaveScriptFileResult {
  success: boolean;
  error?: string;
}

export interface OpenScriptFileResult {
  success: boolean;
  content?: string;
  error?: string;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
