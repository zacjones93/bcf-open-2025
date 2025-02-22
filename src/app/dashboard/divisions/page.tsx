import { Suspense } from "react";
import { DivisionGroups } from "@/app/dashboard/_components/division-groups";

export default function DivisionsPage() {
	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
				<div className="space-y-4">
					<h2 className="text-2xl font-bold tracking-tight">
						Athletes by Division
					</h2>
					<Suspense
						fallback={
							<div className="text-center py-4 text-muted-foreground">
								Loading divisions...
							</div>
						}
					>
						<DivisionGroups />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
