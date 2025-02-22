"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				throw error;
			}

			router.push("/dashboard");
		} catch (error) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-white relative">
			{/* Hero Section */}
			<div className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[url('/images/slider-banner.jpg')] bg-cover bg-center">
				<div className="absolute inset-0 bg-black/50" />
				<div className="relative z-10 flex flex-col items-center text-center">
					<div className="bg-white h-fit w-fit px-4 pb-4 rounded-lg mb-4">
							<Image
								src="/images/bcf-logo.png"
								alt="Boise CrossFit"
								width={300}
								height={75}
								className="mt-8"
						/>
					</div>
					<h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
						WE OPEN TOGETHER
					</h1>
					<p className="text-xl md:text-2xl mb-8 text-white">
						Boise CrossFit 2025 Open
					</p>
					
				</div>
			</div>

			{/* Login Form */}
			<div className="flex-1 flex items-center justify-center px-4 bg-white">
				<Card className="w-full max-w-md border-gray-200 -mt-36 z-10">
					<CardHeader>
						<CardTitle>Sign In</CardTitle>
						<CardDescription>
							Sign in to track your Open performance
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleLogin}>
						<CardContent className="space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="Enter your email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="border-gray-200"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="border-gray-200"
								/>
							</div>
						</CardContent>
						<CardFooter className="flex flex-col space-y-4">
							<Button
								type="submit"
								className="w-full bg-[#255af7] hover:bg-[#255af7]/90 text-white font-semibold"
								disabled={loading}
							>
								{loading ? "Signing in..." : "Sign In"}
							</Button>
							<p className="text-sm text-gray-600 text-center">
								Don't have an account?{" "}
								<Link
									href="/register"
									className="text-[#255af7] hover:text-[#255af7]/90 hover:underline font-medium"
								>
									Sign up
								</Link>
							</p>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}
