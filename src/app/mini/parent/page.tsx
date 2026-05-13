import { MiniExperience } from "@/components/mini-experience";
import { seedData } from "@/data/seed";

export default function MiniParentPage() {
  return <MiniExperience seed={seedData} audience="parent" />;
}
