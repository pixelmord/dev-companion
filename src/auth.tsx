import { useAuthToken } from "@convex-dev/auth/react";
import { createContext, useContext } from "react";

export type AuthContext = {
	isAuthenticated: boolean;
	token: ReturnType<typeof useAuthToken>;
};
const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const token = useAuthToken();
	const isAuthenticated = !!token;

	return (
		<AuthContext.Provider value={{ isAuthenticated, token }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
