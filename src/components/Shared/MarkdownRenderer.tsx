'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  inline?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-blue max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-extrabold mt-8 mb-4 text-blue-600 dark:text-blue-400">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold mt-6 mb-4 text-blue-600 dark:text-blue-400">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-4 mb-3 text-blue-500 dark:text-blue-300">{children}</h3>
          ),
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-blue-500 hover:text-cyan-400 font-semibold transition-colors underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          p: ({ children }) => (
            <p className="my-4 text-gray-800 dark:text-gray-200 leading-relaxed">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-blue-600 dark:text-blue-300">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-blue-500 dark:text-blue-300">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-950/20 rounded-md my-6">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2 marker:text-blue-500 dark:marker:text-blue-400">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-2 marker:text-blue-500 dark:marker:text-blue-400">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-800 dark:text-gray-200 leading-relaxed">{children}</li>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="table-auto w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-blue-100 dark:bg-blue-900 text-left text-blue-800 dark:text-blue-200">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 font-semibold border border-gray-300 dark:border-gray-700">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border border-gray-300 dark:border-gray-700">{children}</td>
          ),
          img: ({ node, ...props }) => (
            <img {...props} className="rounded-xl shadow-md max-w-full h-auto my-4" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
