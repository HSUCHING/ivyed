"use client";

import { useRouter } from "next/navigation";
import { VocabularyLearningModule } from "./vocabulary-learning-module";
import type { VocabularyView } from "./use-vocabulary-session";

export function VocabularyRouteShell({ initialView = "home" }: { initialView?: VocabularyView }) {
  const router = useRouter();
  return (
    <main className="mobile-stage">
      <section className="phone-shell redesigned-phone">
        <div className="mini-content-area">
          <VocabularyLearningModule userId="usr_student_001" initialView={initialView} onBack={() => router.push("/mini/student")} />
        </div>
      </section>
    </main>
  );
}
