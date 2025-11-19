import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  isReadOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, isReadOnly }) => {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner">
      <Editor
        height="100%"
        defaultLanguage="python"
        value={code}
        theme="vs-dark"
        onChange={onChange}
        options={{
          readOnly: isReadOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'JetBrains Mono',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;