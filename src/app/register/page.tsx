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
import { Mail } from "lucide-react";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [registered, setRegistered] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		try {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback`,
				},
			});

			if (error) {
				throw error;
			}

			setRegistered(true);
		} catch (error) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const renderContent = () => {
		if (registered) {
			return (
				<Card className="w-full max-w-md border-gray-200 -mt-12 z-10">
					<CardHeader>
						<CardTitle>Check Your Email</CardTitle>
						<CardDescription>
							We've sent you a confirmation email
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-lg border-2 border-dashed p-6 text-center">
							<Mail className="mx-auto h-12 w-12 text-gray-400" />
							<p className="mt-4 text-sm text-gray-600">
								Please check your email ({email}) and click the verification
								link to complete your registration.
							</p>
						</div>
						<p className="text-sm text-gray-600">
							Once verified, you&apos;ll be able to sign in and set up your
							athlete profile.
						</p>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push("/login")}
						>
							Return to Login
						</Button>
					</CardFooter>
				</Card>
			);
		}

		return (
			<Card className="w-full max-w-md border-gray-200 -mt-12 z-10">
				<CardHeader>
					<CardTitle>Create Account</CardTitle>
					<CardDescription>
						Sign up to join the BCF Open community
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleRegister}>
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
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Confirm your password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
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
							{loading ? "Creating account..." : "Create Account"}
						</Button>
						<p className="text-sm text-gray-600 text-center">
							Already have an account?{" "}
							<Link
								href="/login"
								className="text-[#255af7] hover:text-[#255af7]/90 hover:underline font-medium"
							>
								Sign in
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		);
	};

	return (
		<div className="min-h-screen flex flex-col bg-white">
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

			{/* Register Form */}
			<div className="flex-1 flex items-center justify-center px-4 bg-white">
				{renderContent()}
			</div>

			<div className="min-h-[20vh]"></div>
		</div>
	);
}
