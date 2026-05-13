import { DashboardExperience } from "@/components/dashboard-experience";
import { seedData } from "@/data/seed";

export default function DashboardPage() {
  return <DashboardExperience seed={seedData} />;
}
