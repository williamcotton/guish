import { useCallback } from 'react';
import { Plugins } from './Plugins';
import { genericPlugin } from './plugins/genericPlugin';
import { astToCommand } from './astToCommand';
import {
  ScriptNode,
  CommandNode,
  LogicalExpressionNode,
  PipelineNode,
  ASTType,
  EnhancedModuleType,
} from './types';

export const useAst = () => {
  const astToModules = useCallback((ast: ScriptNode): EnhancedModuleType[] => {
    const newModules: EnhancedModuleType[] = [];

    const processCommand = (
      command: CommandNode | LogicalExpressionNode | PipelineNode,
      operator?: "and" | "pipe"
    ) => {
      if (command.type === "LogicalExpression") {
        processCommand(command.left as CommandNode, "and");
        processCommand(command.right as CommandNode);
      } else if (command.type === "Pipeline") {
        command.commands.forEach((cmd, index) => {
          processCommand(
            cmd as CommandNode,
            index < command.commands.length - 1 ? "pipe" : undefined
          );
        });
      } else if (
        command.type === "Command" &&
        command.name &&
        command.name.text
      ) {
        const plugin = Plugins.get(command.name.text) || genericPlugin;
        newModules.push({ ...plugin.parse(command), operator });
      }
    };

    if (ast.type === "Script" && ast.commands && ast.commands.length > 0) {
      processCommand(ast.commands[0] as CommandNode);
    }

    return newModules;
  }, []);

  const modulesToAst = useCallback(
    (modules: EnhancedModuleType[]): ScriptNode => {
      const buildAst = (
        modules: EnhancedModuleType[]
      ): LogicalExpressionNode | PipelineNode | CommandNode => {
        if (modules.length === 0) {
          return {
            type: "Command",
            name: { text: "", type: "Word" },
          } as CommandNode;
        }
        if (modules.length === 1) {
          const plugin = Plugins.get(modules[0].type) || genericPlugin;
          return plugin.compile(modules[0]) as CommandNode;
        }

        let currentAst: ASTType = (
          Plugins.get(modules[0].type) || genericPlugin
        ).compile(modules[0]);

        for (let i = 1; i < modules.length; i++) {
          const plugin = Plugins.get(modules[i].type) || genericPlugin;
          const compiledModule = plugin.compile(modules[i]);

          if (modules[i - 1].operator === "and") {
            currentAst = {
              type: "LogicalExpression",
              op: "&&",
              left: currentAst,
              right: compiledModule,
            };
          } else {
            if (currentAst.type !== "Pipeline") {
              currentAst = { type: "Pipeline", commands: [currentAst] };
            }
            (currentAst as PipelineNode).commands.push(compiledModule);
          }
        }

        return currentAst as LogicalExpressionNode | PipelineNode | CommandNode;
      };

      return {
        type: "Script",
        commands: [buildAst(modules)],
      };
    },
    []
  );

  const compileCommand = useCallback(
    (modules: EnhancedModuleType[]): string => {
      const compiledAst = modulesToAst(modules);
      return astToCommand(compiledAst);
    },
    [modulesToAst]
  );

  return {
    astToModules,
    compileCommand,
  };
};
