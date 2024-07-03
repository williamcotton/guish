import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditorComponent = ({ value, onChange, language }) => {
  return (
    <Editor
      height="100%"
      className="border rounded p-2"
      loading={false}
      language={language}
      value={value}
      onChange={onChange}
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