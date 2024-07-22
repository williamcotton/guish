import React, { ReactNode, useState, useEffect } from "react";
import { JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

interface OutputViewProps {
  output: string;
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


  const isCSVOrTSV = (str: string): boolean => {
    const lines = str.trim().split("\n");
    if (lines.length < 2) return false; // Need at least a header and one data row

    const delimiter = str.includes("\t") ? "\t" : ",";
    const headerCount = lines[0].split(delimiter).length;

    // Check if all rows have the same number of columns
    return lines.every((line) => line.split(delimiter).length === headerCount);
  };

  const isPNG = (data: string): boolean => {
    if (!data || data.length < 8) return false;
    const pngSignature = [253, 80, 78, 71, 13, 10, 26, 10];
    const bytes = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      bytes[i] = data.charCodeAt(i);
    }
    return pngSignature.every((byte, index) => byte === bytes[index]);
  };

  const encodeToBase64 = (data: string): string => {
    // Use Buffer if available (Node.js environment)
    if (typeof Buffer !== "undefined") {
      return Buffer.from(data, "binary").toString("base64");
    }
    // Fallback for browser environments
    const bytes = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      bytes[i] = data.charCodeAt(i);
    }
    return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
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
        output.trim().startsWith("{") ||
        output.trim().startsWith("[")
      ) {
        const jsonData = JSON.parse(output.trim());
        setParsedData(jsonData);
        setIsTable(false);
        setIsSingleColumn(false);
        setIsImage(false);
        setViewMode("json");
      } else if (isCSVOrTSV(output.trim())) {
        const delimiter = output.includes("\t") ? "\t" : ",";
        const rows = output
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
          setViewMode("table");
        }
      } else {
        setParsedData(null);
        setIsTable(false);
        setIsSingleColumn(false);
        setIsImage(false);
        setViewMode("raw");
      }
    } catch (error) {
      console.error("Error parsing output:", error);
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
        return <JsonView data={parsedData} />;
      case "table":
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(parsedData[0] || {}).map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parsedData.map((row: unknown[], rowIndex: number) => (
                <tr key={rowIndex}>
                  {Object.values(row).map(
                    (cell: ReactNode, cellIndex: number) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
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
      default:
        return <pre>{output}</pre>;
    }
  };

  return (
    <div className="h-full flex flex-col group relative">
      <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setViewMode("raw")}
          className={`px-2 py-1 text-xs rounded ${
            viewMode === "raw" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Raw
        </button>
        {parsedData && !isSingleColumn && (
          <button
            onClick={() => setViewMode("json")}
            className={`px-2 py-1 text-xs rounded ${
              viewMode === "json" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            JSON
          </button>
        )}
        {isTable && (
          <button
            onClick={() => setViewMode("table")}
            className={`px-2 py-1 text-xs rounded ${
              viewMode === "table" ? "bg-blue-500 text-white" : "bg-gray-200"
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
