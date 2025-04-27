import type React from "react";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
	return (
		<div className="mb-8 flex justify-between items-center">
			<div>
				<h1 className="text-3xl font-pixel text-neon-cyan animate-glow">
					{title}
				</h1>
				{subtitle && <p className="text-white/70 mt-1">{subtitle}</p>}
			</div>

			{action && <div>{action}</div>}
		</div>
	);
};

export default PageHeader;
