import type { Doc } from "@convex-server/_generated/dataModel";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Users } from "lucide-react";

interface TeamCardProps {
	team: Doc<"teams">;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
	return (
		<div className="retro-card animate-pixel-fade-in">
			<div className="flex items-center mb-4">
				<img
					src={team.avatar}
					alt={team.name}
					className="w-12 h-12 rounded-md mr-3 pixel-border"
				/>
				<h3 className="text-lg font-pixel text-neon-cyan">{team.name}</h3>
			</div>

			<p className="text-sm text-white/80 mb-4">{team.description}</p>

			<div className="flex justify-between items-center">
				<div className="flex items-center text-xs text-white/50">
					<Users size={14} className="mr-1" />
					<span>{team.members.length} members</span>
				</div>

				<Link
					to={`/teams/${team.id}`}
					className="flex items-center text-xs text-neon-green hover:text-neon-cyan transition-colors"
				>
					<span className="mr-1">View Team</span>
					<ExternalLink size={12} />
				</Link>
			</div>
		</div>
	);
};

export default TeamCard;
