"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RoutineDetail from "@/components/RoutineDetail";

function RoutineDetailLoader() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          No routine specified
        </h1>
        <a href="/routines" className="text-accent hover:underline">
          Back to routines
        </a>
      </div>
    );
  }

  return <RoutineDetail id={id} />;
}

export default function RoutineDetailPage() {
  return (
    <Suspense>
      <RoutineDetailLoader />
    </Suspense>
  );
}
