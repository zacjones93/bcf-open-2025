"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsSkeleton() {
	return (
		<div className="space-y-8">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-[100px]" />
							<Skeleton className="h-4 w-[40px]" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-[60px]" />
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<Skeleton className="h-5 w-[180px]" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-[300px] w-full" />
				</CardContent>
			</Card>

			<div className="space-y-4">
				<h3 className="text-lg font-semibold">
					<Skeleton className="h-6 w-[200px]" />
				</h3>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-5 w-[150px]" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-[300px] w-full" />
								<div className="mt-4 space-y-2">
									{Array.from({ length: 3 }).map((_, j) => (
										<div key={j} className="flex justify-between items-center">
											<Skeleton className="h-4 w-[120px]" />
											<Skeleton className="h-4 w-[80px]" />
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

export function WorkoutCardsSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			{Array.from({ length: 3 }).map((_, i) => (
				<Card key={i}>
					<CardHeader className="flex gap-2 pb-2">
						<div className="flex flex-row items-center justify-between gap-2">
							<Skeleton className="h-5 w-[150px]" />
							<Skeleton className="h-5 w-[60px]" />
						</div>
						<Skeleton className="h-4 w-[100px]" />
					</CardHeader>
					<CardContent className="flex items-center justify-center min-h-[200px]">
						<Skeleton className="h-4 w-[120px]" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export function LogWorkoutFormSkeleton() {
	return (
		<Card className="max-w-2xl mx-auto">
			<CardHeader>
				<Skeleton className="h-6 w-[200px]" />
				<Skeleton className="h-4 w-[300px] mt-2" />
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Skeleton className="h-4 w-[60px]" />
					<Skeleton className="h-10 w-full" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-[80px]" />
					<Skeleton className="h-20 w-full" />
				</div>
				<Skeleton className="h-10 w-full" />
			</CardContent>
		</Card>
	);
}

export function AssignPointsFormSkeleton() {
	return (
		<Card className="max-w-2xl mx-auto">
			<CardHeader>
				<Skeleton className="h-6 w-[200px]" />
				<Skeleton className="h-4 w-[300px] mt-2" />
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Skeleton className="h-4 w-[60px]" />
					<Skeleton className="h-10 w-full" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-[80px]" />
					<Skeleton className="h-10 w-full" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-[120px]" />
					<Skeleton className="h-10 w-full" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-[80px]" />
					<Skeleton className="h-20 w-full" />
				</div>
				<Skeleton className="h-10 w-full" />
			</CardContent>
		</Card>
	);
}
