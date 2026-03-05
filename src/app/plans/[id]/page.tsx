import plansData from "@/data/plans.json";
import PlanDetail from "@/components/PlanDetail";

export function generateStaticParams() {
  return plansData.map((plan) => ({ id: plan.id }));
}

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlanDetail id={id} />;
}
