"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	BarChart3,
	Menu,
	Trophy,
	Home,
	ClipboardCheck,
	X,
	User,
	Users,
} from "lucide-react";
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

const routes = [
	{
		label: "Overview",
		icon: Home,
		href: "/dashboard",
	},
	{
		label: "Log Score",
		icon: ClipboardCheck,
		href: "/dashboard#log-score",
	},
	{
		label: "Teams",
		icon: Trophy,
		href: "/dashboard/teams",
	},
	{
		label: "Divisions",
		icon: Users,
		href: "/dashboard/divisions",
	},
	{
		label: "Point Assignments",
		icon: ClipboardCheck,
		href: "/dashboard/point-assignments",
	},
];

export function DashboardNav() {
	const pathname = usePathname();
	const { user, signOut } = useSupabaseAuth();
	const [open, setOpen] = useState(false);

	return (
		<nav className="sticky top-0 z-50 w-full border-b bg-background">
			{/* Mobile Nav */}
			<div className="flex md:hidden items-center p-4">
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="sm" className="md:hidden">
							<Menu className="h-5 w-5" />
							<span className="sr-only">Toggle menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-[80%] p-0">
						<SheetTitle className="sr-only">Navigation Menu</SheetTitle>
						<div className="flex flex-col gap-4 p-4">
							{routes.map((route) => (
								<Link
									key={route.href}
									href={route.href}
									onClick={() => setOpen(false)}
								>
									<Button
										variant={pathname === route.href ? "secondary" : "ghost"}
										className="w-full justify-start gap-2"
									>
										<route.icon className="h-5 w-5" />
										{route.label}
									</Button>
								</Link>
							))}
							<div className="border-t pt-4 mt-4">
								<Link href="/profile" onClick={() => setOpen(false)}>
									<Button
										variant="ghost"
										className="w-full justify-start gap-2 mb-4"
									>
										<User className="h-5 w-5" />
										Profile
									</Button>
								</Link>
								<Button variant="outline" onClick={signOut} className="w-full">
									Sign Out
								</Button>
							</div>
						</div>
					</SheetContent>
				</Sheet>
				<div className="flex-1 flex justify-center">
					<Link href="/dashboard">
						<h1 className="text-xl font-bold">BCF Open 2025</h1>
					</Link>
				</div>
			</div>

			{/* Desktop Nav */}
			<div className="hidden md:flex justify-between items-center p-4">
				<div className="flex items-center gap-2">
					{routes.map((route) => (
						<Link key={route.href} href={route.href}>
							<Button
								variant={pathname === route.href ? "outline" : "ghost"}
								className="justify-start gap-2"
							>
								<route.icon className="h-5 w-5" />
								{route.label}
							</Button>
						</Link>
					))}
				</div>
				<div className="flex items-center gap-4">
					<Link
						href="/profile"
						className="text-sm text-muted-foreground hover:underline"
					>
						<div className="flex items-center gap-2">
							<User className="h-4 w-4" />
							{user?.email}
						</div>
					</Link>
					<Button variant="outline" onClick={signOut}>
						Sign Out
					</Button>
				</div>
			</div>
		</nav>
	);
}
