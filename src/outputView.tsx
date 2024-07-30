import React, { ReactNode, useState, useEffect } from "react";
import { Buffer } from "buffer";
import { JsonView, darkStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

interface OutputViewProps {
  output: Buffer;
}

const OutputView: React.FC<OutputViewProps> = ({ output }) => {
  const [viewMode, setViewMode] = useState<"raw" | "json" | "table" | "image">(
    "raw"
  );
  const [parsedData, setParsedData] = useState<unknown[]>(null);
  const [isTable, setIsTable] = useState(false);
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);

  const outputString = output ? Buffer.from(output).toString("utf-8") : "";

  const isCSVOrTSV = (str: string): boolean => {
    const lines = str.trim().split("\n");
    if (lines.length < 2) return false; // Need at least a header and one data row

    const delimiter = str.includes("\t") ? "\t" : ",";
    const headerCount = lines[0].split(delimiter).length;

    // Check if first row has the same number of columns as the header
    return lines[1].split(delimiter).length === headerCount;
  };

  const isPNG = (data: Buffer): boolean => {
    if (!data || data.length < 8) return false;
    const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
    return pngSignature.every((byte, index) => data[index] === byte);
  };

  const encodeToBase64 = (data: Buffer) => {
    return Buffer.from(data).toString("base64");
  };

  useEffect(() => {
    if (!output) {
      setParsedData(null);
      setIsTable(false);
      setIsSingleColumn(false);
      setIsImage(false);
      setViewMode("raw");
      return;
    }

    try {
      if (isPNG(output)) {
        setIsImage(true);
        setParsedData(null);
        setIsTable(false);
        setIsSingleColumn(false);
        setImageData(encodeToBase64(output));
        setViewMode("image");
      } else if (
        outputString.trim().startsWith("{") ||
        outputString.trim().startsWith("[")
      ) {
        const jsonData = JSON.parse(outputString.trim());
        setParsedData(jsonData);
        setIsTable(false);
        setIsSingleColumn(false);
        setIsImage(false);
        setViewMode("raw");
      } else if (isCSVOrTSV(outputString.trim())) {
        const delimiter = outputString.includes("\t") ? "\t" : ",";
        const rows = outputString
          .trim()
          .split("\n")
          .map((row) => row.split(delimiter));
        const [headers, ...data] = rows;

        if (headers.length === 1) {
          setIsSingleColumn(true);
          setParsedData(data.map((row) => ({ [headers[0]]: row[0] })));
          setIsTable(true);
          setIsImage(false);
          setViewMode("raw");
        } else {
          setIsSingleColumn(false);
          const jsonData = data.map((row) =>
            Object.fromEntries(
              headers.map((header, index) => [header, row[index]])
            )
          );
          setParsedData(jsonData);
          setIsTable(true);
          setIsImage(false);
          setViewMode("raw");
        }
      } else {
        setParsedData(null);
        setIsTable(false);
        setIsSingleColumn(false);
        setIsImage(false);
        setViewMode("raw");
      }
    } catch (error) {
      // console.error("Error parsing output:", error);
      setParsedData(null);
      setIsTable(false);
      setIsSingleColumn(false);
      setIsImage(false);
      setViewMode("raw");
    }
  }, [output]);

  const renderContent = () => {
    if (!output) return null;

    switch (viewMode) {
      case "json":
        return <JsonView data={parsedData} style={darkStyles} />;
      case "table":
        return (
          <table className="min-w-full divide-y divide-gray-500">
            <thead className="bg-gray-500">
              <tr>
                {Object.keys(parsedData[0] || {}).map((header, index) => (
                  <th
                    key={index}
                    className="bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-500 divide-y divide-gray-500">
              {parsedData.map((row: unknown[], rowIndex: number) => (
                <tr key={rowIndex}>
                  {Object.values(row).map(
                    (cell: ReactNode, cellIndex: number) => (
                      <td
                        key={cellIndex}
                        className="bg-gray-500 *:px-6 py-4 whitespace-nowrap text-sm text-gray-100"
                      >
                        {cell}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "image":
        return (
          <img
            src={`data:image/png;base64,${imageData}`}
            alt="PNG image"
            className="max-w-full h-auto"
          />
        );
      default: {
        return <pre className=" text-green-400">{outputString}</pre>;
      }
    }
  };

  const activeButtonClassName = "bg-blue-500 text-white";
  const inactiveButtonClassName =
    "bg-gray-200 border border-solid border-gray-400  text-gray-1000";

  return (
    <div className="h-full flex flex-col group relative">
      <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setViewMode("raw")}
          className={`px-2 py-1 text-xs rounded ${
            viewMode === "raw" ? activeButtonClassName : inactiveButtonClassName
          }`}
        >
          Raw
        </button>
        {parsedData && !isSingleColumn && (
          <button
            onClick={() => setViewMode("json")}
            className={`px-2 py-1 text-xs rounded ${
              viewMode === "json"
                ? activeButtonClassName
                : inactiveButtonClassName
            }`}
          >
            JSON
          </button>
        )}
        {isTable && (
          <button
            onClick={() => setViewMode("table")}
            className={`px-2 py-1 text-xs rounded ${
              viewMode === "table"
                ? activeButtonClassName
                : inactiveButtonClassName
            }`}
          >
            Table
          </button>
        )}
        {isImage && (
          <button
            onClick={() => setViewMode("image")}
            className={`px-2 py-1 text-xs rounded ${
              viewMode === "image" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Image
          </button>
        )}
      </div>
      <div className="flex-grow overflow-auto">{renderContent()}</div>
    </div>
  );
};

export default OutputView;
