import { MiniExperience } from "@/components/mini-experience";
import { seedData } from "@/data/seed";

export default function MiniStudentPage() {
  return <MiniExperience seed={seedData} audience="student" />;
}
