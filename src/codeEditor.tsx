import React from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

const CodeEditorComponent: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
}) => {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "");
  };

  return (
    <Editor
      height="100%"
      className="border rounded p-2"
      loading={false}
      language={language}
      value={value}
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: false, showSlider: "mouseover" },
        scrollBeyondLastLine: false,
        fontSize: 14,
        automaticLayout: true,
        lineNumbers: "off",
        glyphMargin: false,
        folding: false,
        renderLineHighlight: "none",
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0,
        overviewRulerLanes: 0,
      }}
    />
  );
};

export default CodeEditorComponent;
