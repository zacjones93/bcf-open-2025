import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupabaseAuthProvider } from "@/components/providers/supabase-auth-provider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	metadataBase: new URL("https://boisecrossfitopen.online"),
	title: "BCF Open 2025",
	description: "Track points for the BCF Open 2025 competition",
	authors: [{ name: "Boise CrossFit" }],
	openGraph: {
		title: "BCF Open 2025",
		description: "Boise CrossFit&apos;s in-house Open 2025 competition",
		url: "https://boisecrossfitopen.online",
		siteName: "BCF Open 2025",
		images: [
			{
				url: "/images/og-image.png",
				width: 1200,
				height: 630,
				alt: "BCF Open 2025",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "BCF Open 2025",
		description: "Boise CrossFit&apos;s in-house Open 2025 competition",
		images: ["/images/og-image.png"],
	},
	manifest: "/site.webmanifest",
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
				<Toaster position="top-right" />
			</body>
		</html>
	);
}
