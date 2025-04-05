import type { Doc } from "@convex-server/_generated/dataModel";
import { Link } from "@tanstack/react-router";
import {
	BookOpen,
	Calendar,
	Code,
	ExternalLink,
	Github,
	Headphones,
	Link as LinkIcon,
} from "lucide-react";

interface ResourceCardProps {
	resource: Doc<"resources">;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
	const getIcon = () => {
		switch (resource.type) {
			case "blog":
				return <BookOpen size={18} className="text-neon-cyan" />;
			case "github":
				return <Github size={18} className="text-neon-green" />;
			case "codeSnippet":
				return <Code size={18} className="text-neon-magenta" />;
			case "podcast":
				return <Headphones size={18} className="text-neon-blue" />;
			default:
				return <LinkIcon size={18} className="text-neon-yellow" />;
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return `${date.toLocaleDateString()} @ ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
	};

	return (
		<div className="retro-card animate-pixel-fade-in">
			<div className="flex justify-between items-start mb-2">
				<Link
					to={`/resources/${resource.id}`}
					className="flex items-center hover:text-neon-green transition-colors"
				>
					{getIcon()}
					<span className="ml-2 text-neon-cyan font-pixel">
						{resource.title}
					</span>
				</Link>
				<div className="flex items-center text-xs text-white/50">
					<Calendar size={12} className="mr-1" />
					{formatDate(new Date(resource._creationTime).toISOString())}
				</div>
			</div>

			<p className="text-sm text-white/80 mb-3">{resource.description}</p>

			<div className="flex flex-wrap gap-2 mb-3">
				{resource.tags.map((tag, index) => (
					<span
						key={index}
						className="text-xs bg-retro-light px-2 py-1 rounded-sm text-neon-cyan"
					>
						#{tag}
					</span>
				))}
			</div>

			<div className="flex justify-between items-center">
				{resource.url && (
					<a
						href={resource.url}
						target="_blank"
						rel="noopener noreferrer"
						className="text-xs text-neon-green hover:underline hover:text-neon-cyan transition-colors duration-300 flex items-center"
					>
						{resource.url}
						<ExternalLink size={10} className="ml-1" />
					</a>
				)}

				<Link
					to={`/resources/${resource.id}`}
					className="text-xs text-neon-yellow hover:text-neon-cyan transition-colors duration-300"
				>
					View Details →
				</Link>
			</div>
		</div>
	);
};

export default ResourceCard;
