"use client";

import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
	const { user, signOut } = useSupabaseAuth();

	return (
		<div className="flex items-center justify-between">
			<h1 className="text-4xl font-bold">BCF Open 2025</h1>
			
		</div>
	);
}
