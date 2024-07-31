import React, { useState } from "react";
import { Plugin } from "../Plugins";
import { ModuleType, CommandNode, WordNode } from "../types";

export interface TablechoModuleType extends ModuleType {
  type: "tablecho";
  data: string[][];
}

interface TablechoComponentProps extends TablechoModuleType {
  setData: (data: string[][]) => void;
}

const TablechoComponent: React.FC<TablechoComponentProps> = ({ data, setData }) => {
  const [columns, setColumns] = useState(data[0]?.length || 0);
  const [rows, setRows] = useState(data.length || 0);

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  const addColumn = () => {
    const newData = data.map(row => [...row, '']);
    setData(newData);
    setColumns(columns + 1);
  };

  const addRow = () => {
    const newRow = new Array(columns).fill('');
    setData([...data, newRow]);
    setRows(rows + 1);
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">tablecho</h2>
      <div className="mb-2">
        <button onClick={addColumn} className="mr-2 px-2 py-1 bg-blue-500 text-white rounded">Add Column</button>
        <button onClick={addRow} className="px-2 py-1 bg-blue-500 text-white rounded">Add Row</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {data[0]?.map((_, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Column {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export const tablechoPlugin: Plugin = {
  name: "tablecho",
  command: "tablecho",
  parse: (command: CommandNode): TablechoModuleType => {
    let csvData = "";
    if (command.suffix && command.suffix.length > 0) {
      csvData = (command.suffix[0] as WordNode).text.replace(/^'|'$/g, '');
    }
    const rows = csvData.split('\n').map(row => row.split(','));
    return {
      type: "tablecho",
      data: rows,
    };
  },
  component: TablechoComponent,
  compile: (module: ModuleType): CommandNode => {
    const tablechoModule = module as TablechoModuleType;
    const csvData = tablechoModule.data.map(row => row.join(',')).join('\n');
    return {
      type: "Command",
      name: { text: "tablecho", type: "Word" },
      suffix: [{ type: "Word", text: csvData }],
    };
  },
};
