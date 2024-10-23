import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const viewer = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return null;
		}
		const user = ctx.db.get(userId);
		return user;
	},
});
