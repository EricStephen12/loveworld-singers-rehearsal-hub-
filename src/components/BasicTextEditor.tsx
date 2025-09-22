'use client';

import React, { useRef, useEffect, useState } from 'react';
// import { Bold, Italic } from 'lucide-react';

interface BasicTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export default function BasicTextEditor({ 
  value, 
  onChange, 
  placeholder = "Type your content here...", 
  className = "",
  id 
}: BasicTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const formatText = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      setTimeout(handleInput, 10);
    }
  };

  if (!isMounted) {
    return (
      <div className={`border border-gray-300 rounded-lg ${className}`}>
        <div className="p-4 text-gray-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="px-3 py-1 rounded hover:bg-gray-100 text-gray-600 font-bold text-sm"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="px-3 py-1 rounded hover:bg-gray-100 text-gray-600 italic text-sm"
          title="Italic"
        >
          I
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        id={id}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] p-4 focus:outline-none"
        style={{
          fontFamily: 'inherit',
          lineHeight: '1.6',
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.8rem 0 0.4rem 0;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.6rem 0 0.3rem 0;
        }
        
        [contenteditable] p {
          margin: 0.5rem 0;
        }
        
        [contenteditable] strong, [contenteditable] b {
          font-weight: bold;
        }
        
        [contenteditable] em, [contenteditable] i {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
