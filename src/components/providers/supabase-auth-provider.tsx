"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type SupabaseAuthProviderProps = {
	children: React.ReactNode;
};

type SupabaseAuthContextType = {
	user: User | null;
	loading: boolean;
	signOut: () => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
	user: null,
	loading: true,
	signOut: async () => {},
});

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		const getUser = async () => {
			try {
				// First check if we have a cached session in cookies
				const cachedSessionStr = document.cookie
					.split("; ")
					.find((row) => row.startsWith("cached_session="))
					?.split("=")[1];

				if (cachedSessionStr) {
					try {
						const cachedSession = JSON.parse(
							decodeURIComponent(cachedSessionStr)
						);
						if (cachedSession?.user) {
							setUser(cachedSession.user);
							setLoading(false);
							return;
						}
					} catch (error) {
						console.error("Error parsing cached session:", error);
					}
				}

				// If no cached session or error parsing it, fetch from Supabase
				const {
					data: { user },
				} = await supabase.auth.getUser();
				setUser(user);
			} catch (error) {
				console.error("Error getting user:", error);
			} finally {
				setLoading(false);
			}
		};

		// Get initial user
		getUser();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			router.refresh();
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [supabase, router]);

	const signOut = async () => {
		await supabase.auth.signOut();
		router.push("/login");
	};

	const value = {
		user,
		loading,
		signOut,
	};

	return (
		<SupabaseAuthContext.Provider value={value}>
			{children}
		</SupabaseAuthContext.Provider>
	);
}

export const useSupabaseAuth = () => {
	const context = useContext(SupabaseAuthContext);
	if (context === undefined) {
		throw new Error(
			"useSupabaseAuth must be used within a SupabaseAuthProvider"
		);
	}
	return context;
};
