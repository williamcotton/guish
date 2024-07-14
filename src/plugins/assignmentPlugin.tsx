import React from "react";
import { Plugin } from "../Plugins";
import { ModuleType, CommandNode, AssignmentWordNode } from "../types";

export interface AssignmentModuleType extends ModuleType {
  type: "assignment";
  variable: string;
  value: string;
}

interface AssignmentComponentProps extends AssignmentModuleType {
  setVariable: (variable: string) => void;
  setValue: (value: string) => void;
}

const AssignmentComponent: React.FC<AssignmentComponentProps> = ({
  variable,
  value,
  setVariable,
  setValue,
}) => (
  <div className="flex flex-col w-full h-full">
    <h2 className="text-sm font-semibold mb-1 text-gray-700">Assignment</h2>
    <div className="flex flex-col sm:flex-row gap-1 flex-grow">
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={variable}
          onChange={(e) => setVariable(e.target.value)}
          className="w-full p-1 text-sm border rounded"
          placeholder="Variable"
        />
      </div>
      <div className="flex-none text-center self-center"></div>
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full p-1 text-sm border rounded"
          placeholder="Value"
        />
      </div>
    </div>
  </div>
);

// ... rest of the assignmentPlugin code remains the same

export const assignmentPlugin: Plugin = {
  name: "Assignment",
  command: "assignment",
  parse: (command: CommandNode): AssignmentModuleType => {
    const assignmentWord = command.prefix?.find(
      (word): word is AssignmentWordNode => word.type === "AssignmentWord"
    );
    const [variable, value] = assignmentWord?.text.split("=") || ["", ""];
    return {
      type: "assignment",
      variable,
      value,
    };
  },
  component: AssignmentComponent,
  compile: (module: ModuleType): CommandNode => {
    const assignmentModule = module as AssignmentModuleType;
    return {
      type: "Command",
      prefix: [
        {
          type: "AssignmentWord",
          text: `${assignmentModule.variable}=${assignmentModule.value}`,
        },
      ],
    };
  },
};
