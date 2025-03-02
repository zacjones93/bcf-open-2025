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

export default function UpdatePasswordClient() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const router = useRouter();
	const supabase = createClient();

	const handleUpdatePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Validate passwords
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			setLoading(false);
			return;
		}

		try {
			const { error } = await supabase.auth.updateUser({
				password,
			});

			if (error) {
				throw error;
			}

			setMessage("Password updated successfully! Redirecting to login...");

			// Redirect after a short delay
			setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch (error) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-white">
			{/* Header */}
			<div className="bg-white py-4 shadow-sm">
				<div className="container mx-auto px-4">
					<Link href="/">
						<Image
							src="/images/bcf-logo.png"
							alt="Boise CrossFit"
							width={200}
							height={50}
							className="h-12 w-auto"
						/>
					</Link>
				</div>
			</div>

			{/* Update Password Form */}
			<div className="flex-1 flex items-center justify-center px-4 py-12">
				<Card className="w-full max-w-md border-gray-200">
					<CardHeader>
						<CardTitle>Update Password</CardTitle>
						<CardDescription>
							Create a new password for your account
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleUpdatePassword}>
						<CardContent className="space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
							{message && (
								<Alert className="bg-green-50 text-green-800 border-green-200">
									<AlertDescription>{message}</AlertDescription>
								</Alert>
							)}
							<div className="space-y-2">
								<Label htmlFor="password">New Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="Enter new password"
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
									placeholder="Confirm new password"
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
								disabled={loading || !!message}
							>
								{loading ? "Updating..." : "Update Password"}
							</Button>
							<p className="text-sm text-gray-600 text-center">
								Remember your password?{" "}
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
			</div>
		</div>
	);
}
