import exercisesData from "@/data/exercises.json";
import ExerciseDetail from "@/components/ExerciseDetail";

export function generateStaticParams() {
  return exercisesData.map((ex) => ({ id: ex.id }));
}

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExerciseDetail id={id} />;
}
