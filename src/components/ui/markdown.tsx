"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
	children: string;
}

export function Markdown({ children }: MarkdownProps) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				// Add custom components for markdown elements if needed
				h1: ({ children }) => (
					<h1 className="text-3xl font-bold mb-4">{children}</h1>
				),
				h2: ({ children }) => (
					<h2 className="text-2xl font-bold mb-3">{children}</h2>
				),
				h3: ({ children }) => (
					<h3 className="text-xl font-bold mb-2">{children}</h3>
				),
				p: ({ children }) => <p className="mb-4">{children}</p>,
				ul: ({ children }) => (
					<ul className="list-disc pl-6 mb-4">{children}</ul>
				),
				ol: ({ children }) => (
					<ol className="list-decimal pl-6 mb-4">{children}</ol>
				),
				li: ({ children }) => <li className="">{children}</li>,
				a: ({ href, children }) => (
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 dark:text-blue-400 underline decoration-blue-600/30 dark:decoration-blue-400/30 underline-offset-2 hover:decoration-blue-600 dark:hover:decoration-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
					>
						{children}
					</a>
				),
				blockquote: ({ children }) => (
					<blockquote className="border-l-4 border-muted pl-4 italic mb-4">
						{children}
					</blockquote>
				),
				code: ({ children }) => (
					<code className="bg-muted px-1.5 py-0.5 rounded text-sm">
						{children}
					</code>
				),
				pre: ({ children }) => (
					<pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
						{children}
					</pre>
				),
				hr: ({ children }) => (
					<hr className="my-4 border-t border-muted" />
				),
			}}
		>
			{children}
		</ReactMarkdown>
	);
}
