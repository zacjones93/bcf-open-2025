import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";

export default async function WorkoutDetailsPage({
	params,
}: {
	params: { id: string };
}) {
	const supabase = await createServerClient();

	const { data: workout } = await supabase
		.from("workouts")
		.select("*")
		.eq("id", params.id)
		.single();

	if (!workout) {
		notFound();
	}

	return (
		<div className="min-h-screen bg-background p-8">
			<div className="mx-auto max-w-3xl space-y-8">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">{workout.name}</CardTitle>
						{workout.standards_and_score_link && (
							<Button variant="outline" asChild className="mt-4">
								<a
									href={workout.standards_and_score_link}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2"
								>
									View Standards & Scoring
									<ArrowUpRight className="h-4 w-4" />
								</a>
							</Button>
						)}
					</CardHeader>
					<CardContent className="prose dark:prose-invert max-w-none">
						{workout.details ? (
							<Markdown>{workout.details}</Markdown>
						) : (
							<p className="text-muted-foreground">No details available yet.</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
