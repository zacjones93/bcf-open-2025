"use client";

import { useState } from "react";
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

export default function ResetPasswordPage() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const supabase = createClient();

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/update-password`,
			});

			if (error) {
				throw error;
			}

			setSuccess(true);
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

			{/* Reset Password Form */}
			<div className="flex-1 flex items-center justify-center px-4 py-12">
				<Card className="w-full max-w-md border-gray-200">
					<CardHeader>
						<CardTitle>Reset Password</CardTitle>
						<CardDescription>
							Enter your email address and we'll send you a link to reset your
							password
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleResetPassword}>
						<CardContent className="space-y-4">
							{error && (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
							{success && (
								<Alert className="bg-green-50 text-green-800 border-green-200">
									<AlertDescription>
										Password reset link sent! Check your email for instructions.
									</AlertDescription>
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
						</CardContent>
						<CardFooter className="flex flex-col space-y-4">
							<Button
								type="submit"
								className="w-full bg-[#255af7] hover:bg-[#255af7]/90 text-white font-semibold"
								disabled={loading || success}
							>
								{loading ? "Sending..." : "Send Reset Link"}
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
