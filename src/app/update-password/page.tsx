import UpdatePasswordClient from "./_components/update-password-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

const UpdatePasswordPage = async () => {
	const supabase = await createClient();
	const { data: { user }, error } = await supabase.auth.getUser()


	if (!user) {
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

				{/* Error Message */}
				<div className="flex-1 flex items-center justify-center px-4 py-12">
					<Card className="w-full max-w-md border-gray-200">
						<CardHeader>
							<CardTitle>Invalid Link</CardTitle>
							<CardDescription>
								This password reset link is invalid or has expired.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col items-center space-y-4">
							<p className="text-center text-gray-600">
								Please request a new password reset link.
							</p>
							<Button asChild className="bg-[#255af7] hover:bg-[#255af7]/90">
								<Link href="/reset-password">Request New Link</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return <UpdatePasswordClient />;
};

export default UpdatePasswordPage;
