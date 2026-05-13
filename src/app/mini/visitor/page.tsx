import { MiniExperience } from "@/components/mini-experience";
import { seedData } from "@/data/seed";

export default function MiniVisitorPage() {
  return <MiniExperience seed={seedData} audience="visitor" />;
}
