import { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/nav";

interface ProfileLayoutProps {
	children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
	return (
		<div className="min-h-screen flex flex-col max-w-7xl mx-auto">
			<DashboardNav />
			<main className="flex-1">{children}</main>
		</div>
	);
}
