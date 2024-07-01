import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditorComponent = ({ value, onChange, language }) => {
  return (
    <Editor
      height="100%"
      width="100%"
      language={language}
      value={value}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        automaticLayout: true,
      }}
    />
  );
};

export default CodeEditorComponent;