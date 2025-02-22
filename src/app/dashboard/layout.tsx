import { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/nav";

interface DashboardLayoutProps {
	children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<div className="min-h-screen flex flex-col max-w-7xl mx-auto">
			<DashboardNav />
			<main className="flex-1">{children}</main>
		</div>
	);
}
