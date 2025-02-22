import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupabaseAuthProvider } from "@/components/providers/supabase-auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "BCF Open 2025",
	description: "Track points for the BCF Open 2025 competition",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<SupabaseAuthProvider>{children}</SupabaseAuthProvider>
			</body>
		</html>
	);
}
