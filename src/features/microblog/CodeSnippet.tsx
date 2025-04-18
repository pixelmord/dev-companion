import { Check, Copy } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { toast } from "sonner";
interface CodeSnippetProps {
	code: string;
	language: string;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ code, language }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(code);
		setCopied(true);

		toast.success("Code copied!", {
			description: "Code snippet copied to clipboard",
		});

		setTimeout(() => setCopied(false), 2000);
	};

	// Apply syntax highlighting class based on language
	const getLanguageClass = () => {
		switch (language.toLowerCase()) {
			case "javascript":
				return "language-javascript";
			case "typescript":
				return "language-typescript";
			case "jsx":
				return "language-jsx";
			case "tsx":
				return "language-tsx";
			case "css":
				return "language-css";
			case "html":
				return "language-html";
			default:
				return `language-${language.toLowerCase()}`;
		}
	};

	return (
		<div className="relative font-mono border border-retro-light rounded-sm overflow-hidden">
			<div className="bg-retro-medium px-3 py-1 flex justify-between items-center">
				<div className="text-xs text-neon-green">{language}</div>
				<button
					onClick={handleCopy}
					className="text-white/50 hover:text-white"
					type="button"
				>
					{copied ? (
						<Check size={14} className="text-neon-green" />
					) : (
						<Copy size={14} />
					)}
				</button>
			</div>
			<div className="p-3 bg-retro-dark overflow-x-auto">
				<pre className={`text-xs text-neon-green ${getLanguageClass()}`}>
					{code}
				</pre>
			</div>
		</div>
	);
};

export default CodeSnippet;
