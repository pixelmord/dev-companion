import type { Doc } from "@convex-server/_generated/dataModel";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Github } from "lucide-react";

interface ProjectCardProps {
	project: Doc<"projects">;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
	return (
		<div className="retro-card animate-pixel-fade-in h-full flex flex-col">
			<div className="flex justify-between items-start">
				<h3 className="text-lg font-pixel text-neon-cyan">{project.name}</h3>
				<a
					href={project.vcs.url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-white/70 hover:text-neon-cyan transition-colors"
				>
					{project.vcs.type === "github" && <Github size={18} />}
				</a>
			</div>

			<p className="text-sm text-white/80 my-3 grow">{project.description}</p>

			<div className="flex justify-between items-center mt-4">
				<div className="text-xs text-white/50">
					<span>{project.resources.length} resources</span>
				</div>

				<Link
					to={`/projects/${project._id}`}
					className="flex items-center text-xs text-neon-green hover:text-neon-cyan transition-colors"
				>
					<span className="mr-1">View Dashboard</span>
					<ExternalLink size={12} />
				</Link>
			</div>
		</div>
	);
};

export default ProjectCard;
