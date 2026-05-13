"use client";

import { ArrowLeft, BarChart3, BookOpen, Check, ChevronRight, Clock3, FileText, Layers3, RotateCcw, Settings2, Sparkles, Star, Target, Volume2, X } from "lucide-react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { StudyChoice } from "./engine";
import { useVocabularySession, type VocabularyView } from "./use-vocabulary-session";
import type { LearningPreference, PracticeQuestion, VocabularyGoal, VocabularyLevel, Word, WrongWordRecord } from "./types";

export function VocabularyLearningModule({
  userId,
  onBack,
  onDailyComplete,
  initialView
}: {
  userId: string;
  onBack: () => void;
  onDailyComplete?: (summary: { newWords: number; reviewWords: number; wrongWords: number }) => void;
  initialView?: VocabularyView;
}) {
  const session = useVocabularySession(userId, initialView);

  return (
    <section className="task-screen vocab-module">
      <header className="task-header vocab-module-header">
        <button className="icon-button" type="button" aria-label="返回学习概览" onClick={session.view === "home" ? onBack : session.backHome}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <strong>词汇学习</strong>
          <span>{session.currentScenario.name} · {session.currentBook.name}</span>
        </div>
      </header>

      {session.view === "entry" && <EntryView session={session} />}
      {session.view === "onboarding" && <OnboardingView session={session} />}
      {session.view === "scenario" && <ScenarioView session={session} />}
      {session.view === "books" && <BooksView session={session} />}
      {session.view === "preferences" && <PreferencesView session={session} />}
      {session.view === "plan" && <PlanView session={session} />}
      {session.view === "home" && <VocabularyHome session={session} onBack={onBack} />}
      {session.view === "learn" && <LearnView session={session} />}
      {(session.view === "practice" || session.view === "review" || session.view === "test") && <PracticeView session={session} />}
      {session.view === "feedback" && <FeedbackOnlyView session={session} />}
      {session.view === "wrong" && <WrongBookView session={session} />}
      {session.view === "settings" && <SettingsView session={session} />}
      {session.view === "report" && (
        <ReportView
          session={session}
          onDailyComplete={() =>
            onDailyComplete?.({
              newWords: session.task.newWordIds.length,
              reviewWords: session.task.reviewWordIds.length,
              wrongWords: session.task.wrongWordIds.length
            })
          }
        />
      )}
    </section>
  );
}

function EntryView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  return (
    <div className="vocab-flow">
      <section className="vocab-hero-panel">
        <div>
          <span className="tiny-label">VOCABULARY MODULE</span>
          <h2>任务驱动的背单词学习模块</h2>
          <p>目标、场景、素材、词库、计划和复习调度会组合成每日可执行任务。</p>
        </div>
        <div className="vocab-hero-orb">
          <Target size={24} />
          <span>LearningItem</span>
        </div>
      </section>
      <div className="vocab-action-grid">
        <button className="vocab-primary-action" type="button" onClick={() => session.setView(session.profile?.initialized ? "home" : "onboarding")}>
          <Sparkles size={18} />
          <span>
            <strong>{session.profile?.initialized ? "进入今日任务" : "开始初始化"}</strong>
            <small>首次使用会先完成目标、场景和词库选择</small>
          </span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function OnboardingView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  const goals: Array<{ id: VocabularyGoal; label: string; desc: string }> = [
    { id: "ielts", label: "雅思学习", desc: "适合准备 IELTS 考试，重点覆盖学术阅读、听力和写作高频词。" },
    { id: "toefl", label: "托福学习", desc: "适合准备 TOEFL 考试，重点覆盖学术场景和校园场景词汇。" },
    { id: "cet4", label: "四六级学习", desc: "适合大学英语四六级备考，重点覆盖高频考试词汇。" },
    { id: "postgraduate", label: "考研英语", desc: "适合考研阅读、翻译和写作词汇积累。" },
    { id: "business", label: "商务英语", desc: "适合职场会议、邮件、汇报和商务沟通。" },
    { id: "daily", label: "日常英语", desc: "适合日常交流、旅行、生活表达。" },
    { id: "custom", label: "自定义目标", desc: "适合自己上传词库或自由安排学习。" }
  ];

  return (
    <div className="vocab-flow vocab-setup-screen">
      <VocabularySetupSteps current="goal" />
      <div className="vocab-step-content" key="goal">
        <SetupSection icon={<Target size={18} />} title="你想通过背单词达成什么目标？" desc="目标会决定系统推荐的场景、词库和每日任务方向。">
          <div className="vocab-card-list">
            {goals.map((goal) => (
              <button className={session.draftGoal === goal.id ? "active" : ""} key={goal.id} type="button" onClick={() => session.completeOnboarding(goal.id)}>
                <strong>{goal.label}</strong>
                <span>{goal.desc}</span>
              </button>
            ))}
          </div>
        </SetupSection>
      </div>
    </div>
  );
}

function ScenarioView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  return (
    <div className="vocab-flow vocab-setup-screen">
      <VocabularySetupSteps current="scenario" />
      <div className="vocab-step-content" key="scenario">
        <SetupSection icon={<Layers3 size={18} />} title="你希望这些单词主要用于什么场景？" desc="场景承载学习用途，系统会据此推荐学习词库。">
          <div className="vocab-card-list">
            {session.scenarios.map((scenario) => (
              <button className={session.selectedScenarioId === scenario.id ? "active" : ""} key={scenario.id} type="button" onClick={() => session.confirmScenario(scenario.id)}>
                <strong>{scenario.name}</strong>
                <span>{scenario.description}</span>
                <small>{scenario.tags.join(" · ")}</small>
              </button>
            ))}
          </div>
        </SetupSection>
      </div>
    </div>
  );
}

function BooksView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  return (
    <div className="vocab-flow vocab-setup-screen">
      <VocabularySetupSteps current="book" />
      <div className="vocab-step-content" key="book">
        <SetupSection icon={<BookOpen size={18} />} title="选择你的学习词库" desc={`系统为你推荐：${session.currentBook.name}，推荐理由：与你的目标和场景匹配。`}>
          <div className="vocab-card-list">
            {session.books.map((book) => (
              <button className={session.selectedBookId === book.id ? "active" : ""} key={book.id} type="button" onClick={() => session.confirmBook(book.id)}>
                <strong>{book.name}</strong>
                <span>{book.description}</span>
                <small>适用目标：{goalLabel(session.draftGoal)} · 单词数量：{book.totalItems} · 难度：{difficultyLabel(book.difficulty)} · 预计 {session.draftDurationDays} 天完成</small>
              </button>
            ))}
          </div>
        </SetupSection>
      </div>
    </div>
  );
}

function PreferencesView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  const levels: Array<{ id: VocabularyLevel; label: string; desc: string }> = [
    { id: "starter", label: "入门", desc: "很多基础词还不熟" },
    { id: "basic", label: "基础", desc: "认识常见词，但词汇量不稳定" },
    { id: "intermediate", label: "进阶", desc: "有一定词汇量，希望系统巩固提升" },
    { id: "advanced", label: "冲刺", desc: "临近考试，需要高强度复习" }
  ];
  const preferences: Array<{ id: LearningPreference; label: string; desc: string }> = [
    { id: "memory", label: "记忆优先", desc: "增加识别题和复习频率" },
    { id: "spelling", label: "拼写优先", desc: "增加拼写输入题" },
    { id: "listening", label: "听力优先", desc: "增加听音选词题" },
    { id: "example", label: "例句优先", desc: "增加例句填空题" }
  ];

  return (
    <div className="vocab-flow vocab-setup-screen">
      <VocabularySetupSteps current="preference" />
      <div className="vocab-step-content" key="preference">
        <SetupSection icon={<Settings2 size={18} />} title="设置你的学习节奏" desc="固定选项覆盖大多数用户，后续可扩展自定义日期和分钟数。">
          <strong className="vocab-field-label">当前水平</strong>
          <ChoiceGrid>
            {levels.map((level) => (
              <button className={session.draftLevel === level.id ? "active" : ""} key={level.id} type="button" onClick={() => session.setDraftLevel(level.id)} title={level.desc}>
                {level.label}
              </button>
            ))}
          </ChoiceGrid>
          <strong className="vocab-field-label">期待完成时间</strong>
          <ChoiceGrid>
            {([30, 60, 90] as const).map((days) => (
              <button className={session.draftDurationDays === days ? "active" : ""} key={days} type="button" onClick={() => session.setDraftDurationDays(days)}>
                {days} 天
              </button>
            ))}
          </ChoiceGrid>
          <strong className="vocab-field-label">每日学习时间</strong>
          <ChoiceGrid>
            {([10, 20, 30] as const).map((minutes) => (
              <button className={session.draftDailyMinutes === minutes ? "active" : ""} key={minutes} type="button" onClick={() => session.setDraftDailyMinutes(minutes)}>
                {minutes} 分钟
              </button>
            ))}
          </ChoiceGrid>
          <strong className="vocab-field-label">练习偏好</strong>
          <div className="vocab-card-list">
            {preferences.map((preference) => (
              <button className={session.draftPreferences[0] === preference.id ? "active" : ""} key={preference.id} type="button" onClick={() => session.confirmPreferences(preference.id)}>
                <strong>{preference.label}</strong>
                <span>{preference.desc}</span>
              </button>
            ))}
          </div>
        </SetupSection>
      </div>
    </div>
  );
}

function PlanView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  const [generating, setGenerating] = useState(false);
  const previewPlan = session.pendingPlan ?? session.plan;
  const previewTask = {
    newWords: Math.min(previewPlan.dailyNewItems, session.currentBook.totalItems),
    reviews: previewPlan.dailyReviewLimit,
    wrong: 0,
    minutes: Math.round(Math.min(previewPlan.dailyNewItems, session.currentBook.totalItems) * 2 + previewPlan.dailyReviewLimit * 0.8)
  };

  useEffect(() => {
    if (!generating) return;
    const timer = window.setTimeout(session.confirmPlan, 5000);
    return () => window.clearTimeout(timer);
  }, [generating]);

  return (
    <div className="vocab-flow vocab-setup-screen">
      {generating && <PlanGeneratingOverlay />}
      <VocabularySetupSteps current="plan" />
      <div className="vocab-step-content" key="plan">
        <section className="vocab-plan-panel">
          <div>
            <span className="tiny-label">CONFIRM PLAN</span>
            <h2>确认之前设置</h2>
            <p>
              请先确认目标、场景、词库和学习节奏。确认后系统会生成今日任务、复习队列和错词强化安排。
            </p>
          </div>
          <div className="vocab-plan-summary">
            <strong>{previewPlan.testCycle === "weekly" ? "每 7 天" : "每 100 词"}</strong>
            <span>阶段测试</span>
          </div>
        </section>
        <div className="vocab-task-grid">
          <MetricTile label="每日新词" value={previewPlan.dailyNewItems} suffix="个" tone="blue" />
          <MetricTile label="计划周期" value={previewPlan.planDurationDays} suffix="天" tone="violet" />
          <MetricTile label="预计用时" value={previewPlan.dailyStudyMinutes} suffix="分钟" tone="amber" />
          <MetricTile label="复习上限" value={previewPlan.dailyReviewLimit} suffix="个" tone="green" />
        </div>
        <section className="vocab-plan-detail">
          <span>目标：{goalLabel(previewPlan.goal)}</span>
          <span>场景：{session.currentScenario.name}</span>
          <span>词库：{session.currentBook.name}</span>
          <span>当前水平：{levelLabel(previewPlan.level)}</span>
          <span>完成时间：{previewPlan.planDurationDays} 天</span>
          <span>每日学习：{previewPlan.dailyStudyMinutes} 分钟</span>
          <span>练习偏好：{preferenceLabel(previewPlan.practicePreference)}</span>
          <span>阶段检查：每 7 天一次学习总结</span>
        </section>
        <section className="vocab-ai-advice">
          <Sparkles size={17} />
          <span>
            今日任务将按「错词强化 &gt; 即将遗忘词 &gt; 到期复习 &gt; 今日新词」生成。首次使用会先初始化词库进度，再进入今日任务控制台。
          </span>
        </section>
        <button className="vocab-generate-plan" type="button" onClick={() => setGenerating(true)} disabled={generating}>
          <span className="vocab-generate-icon">
            <Sparkles size={18} />
          </span>
          <span>
            <strong>确认生成学习计划</strong>
            <small>生成今日任务、复习队列和错词强化</small>
          </span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function VocabularyHome({ session, onBack }: { session: ReturnType<typeof useVocabularySession>; onBack: () => void }) {
  const totalToday = session.task.newWordIds.length + session.task.reviewWordIds.length + session.task.wrongWordIds.length;

  return (
    <div className="vocab-flow">
      <section className="vocab-hero-panel">
        <div>
          <span className="tiny-label">TODAY VOCAB</span>
          <h2>{totalToday ? "今日任务" : "今天没有强制任务"}</h2>
          <p>执行顺序：先完成间隔复习，再学习新词，然后处理错词强化，最后查看今日小结。</p>
        </div>
        <div className="vocab-hero-orb">
          <strong>{session.libraryProgress}%</strong>
          <span>词库进度</span>
        </div>
      </section>

      <div className="vocab-task-grid">
        <MetricTile label="新词" value={session.task.newWordIds.length} suffix="词" tone="blue" />
        <MetricTile label="复习" value={session.task.reviewWordIds.length} suffix="词" tone="violet" />
        <MetricTile label="错词" value={session.task.wrongWordIds.length} suffix="词" tone="amber" />
        <MetricTile label="预计" value={session.task.estimatedMinutes} suffix="分钟" tone="green" />
      </div>
      <section className="vocab-ai-advice">
        <Sparkles size={17} />
        <span>{session.task.generatedReason.join("，") || "今天适合轻量复习，保持连续学习节奏。"}</span>
      </section>

      <div className="vocab-action-grid">
        <button className="vocab-primary-action" type="button" onClick={session.startTodayLearning}>
          <Sparkles size={18} />
          <span>
            <strong>开始今日学习</strong>
            <small>复习 → 新词 → 错词 → 今日报告</small>
          </span>
          <ChevronRight size={18} />
        </button>
        <button type="button" onClick={session.startReview} disabled={!session.task.reviewWordIds.length && !session.task.wrongWordIds.length}>
          <RotateCcw size={18} />
          <span>进入复习</span>
        </button>
        <button type="button" onClick={() => session.setView("wrong")}>
          <BookOpen size={18} />
          <span>查看错词本</span>
        </button>
        <button type="button" onClick={session.openReport}>
          <BarChart3 size={18} />
          <span>查看学习报告</span>
        </button>
        <button type="button" onClick={() => session.setView("books")}>
          <BookOpen size={18} />
          <span>查看词库</span>
        </button>
        <button type="button" onClick={session.startStageTest} disabled={!session.task.testRequired}>
          <FileText size={18} />
          <span>阶段测试</span>
        </button>
        <button type="button" onClick={() => session.setView("settings")}>
          <Settings2 size={18} />
          <span>调整计划</span>
        </button>
      </div>

      <button className="secondary-link vocab-exit" type="button" onClick={onBack}>
        回到主学习页
      </button>
    </div>
  );
}

function LearnView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  const word = session.currentLearnWord;
  const [cardAction, setCardAction] = useState<StudyChoice | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, rawX: 0, active: false });
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const activePointerRef = useRef<number | null>(null);
  if (!word) {
    return <EmptyState title="当前没有新词" body="可以先进入复习或错词强化。" action="返回任务页" onAction={session.backHome} />;
  }

  function commitChoice(choice: StudyChoice) {
    if (cardAction) return;
    setCardAction(choice);
    window.setTimeout(() => {
      session.markStudyChoice(choice);
      setCardAction(null);
      setDrag({ x: 0, y: 0, rawX: 0, active: false });
    }, choice === "fuzzy" ? 310 : 360);
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (cardAction) return;
    if ((event.target as HTMLElement).closest("button")) return;
    event.preventDefault();
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    activePointerRef.current = event.pointerId;
    setDrag((current) => ({ ...current, active: true }));
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (activePointerRef.current !== event.pointerId) return;
    if (!dragStartRef.current || cardAction) return;
    const rawX = event.clientX - dragStartRef.current.x;
    const rawY = event.clientY - dragStartRef.current.y;
    event.preventDefault();
    setDrag({ x: dampSwipe(rawX), y: dampSwipe(rawY) * 0.55, rawX, active: true });
  }

  function handlePointerEnd(event: PointerEvent<HTMLElement>) {
    if (activePointerRef.current !== event.pointerId) return;
    if (!dragStartRef.current || cardAction) return;
    dragStartRef.current = null;
    activePointerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag.rawX > 118) {
      commitChoice("known");
      return;
    }
    if (drag.rawX < -118) {
      commitChoice("unknown");
      return;
    }
    setDrag({ x: 0, y: 0, rawX: 0, active: false });
  }

  const rotate = Math.max(-12, Math.min(12, drag.x / 14));
  const cardStyle =
    cardAction === "known"
      ? ({ "--swipe-x": "140%", "--swipe-rotate": "14deg" } as CSSProperties & Record<"--swipe-x" | "--swipe-rotate", string>)
      : cardAction === "unknown"
        ? ({ "--swipe-x": "-140%", "--swipe-rotate": "-14deg" } as CSSProperties & Record<"--swipe-x" | "--swipe-rotate", string>)
        : cardAction === "fuzzy"
          ? undefined
          : ({ transform: `translate3d(${drag.x}px, ${drag.y * 0.18}px, 0) rotate(${rotate}deg)` } as CSSProperties);

  return (
    <div className="vocab-flow">
      <ProgressHeader label="新词学习" current={session.learnIndex + 1} total={session.learnTotal} />
      <div
        className={`vocab-swipe-stage ${drag.active ? "dragging" : ""} ${cardAction ? `is-${cardAction}` : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
      >
        {[...session.learnStackWords.slice(0, 4)].reverse().map((stackWord) => {
          const index = session.learnStackWords.findIndex((item) => item.id === stackWord.id);
          return (
          index === 0 ? (
            <article
              className={`vocab-swipe-card top ${cardAction ? `exit-${cardAction}` : ""}`}
              style={cardStyle}
              key={stackWord.id}
            >
              <WordLearningCard word={word} />
            </article>
          ) : (
            <article
              className="vocab-swipe-card stack"
              style={
                {
                  "--stack-y": `${index * 18}px`,
                  "--stack-z": String(12 - index),
                  "--stack-scale": String(1 - index * 0.045)
                } as CSSProperties & Record<"--stack-y" | "--stack-z" | "--stack-scale", string>
              }
              aria-hidden="true"
              key={stackWord.id}
            >
              <WordLearningCard word={stackWord} />
            </article>
          )
          );
        })}
      </div>
      <div className="vocab-study-actions">
        <button className="unknown" type="button" onClick={() => commitChoice("unknown")} disabled={Boolean(cardAction)}>
          <X size={18} />
          不认识
        </button>
        <button className="fuzzy" type="button" onClick={() => commitChoice("fuzzy")} disabled={Boolean(cardAction)}>
          <Sparkles size={18} />
          模糊
        </button>
        <button className="known" type="button" onClick={() => commitChoice("known")} disabled={Boolean(cardAction)}>
          <Check size={18} />
          认识
        </button>
      </div>
    </div>
  );
}

function dampSwipe(value: number) {
  const limit = 92;
  const sign = Math.sign(value);
  const distance = Math.abs(value);
  if (distance <= limit) return value;
  return sign * (limit + (distance - limit) * 0.34);
}

function PracticeView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  const question = session.currentQuestion;
  const [answer, setAnswer] = useState("");
  const title = session.view === "test" ? "阶段测试" : session.view === "review" ? "今日复习" : session.practiceMode === "wrong" ? "错词强化" : "即时练习";
  const feedbackWord = question ? session.words.find((word) => word.id === question.itemId) : null;

  if (!question) {
    return <EmptyState title="暂无可练习题目" body="完成新词学习后会自动生成练习。" action="返回任务页" onAction={session.backHome} />;
  }

  function submit(value: string) {
    session.submitAnswer(value);
    setAnswer("");
  }

  return (
    <div className="vocab-flow">
      <ProgressHeader label={title} current={session.questionIndex + 1} total={session.questionTotal} progress={session.progress} />
      <QuestionCard question={question} answer={answer} setAnswer={setAnswer} submit={submit} disabled={Boolean(session.feedback)} />
      {session.feedback && (
        <div className={`vocab-feedback ${session.feedback.isCorrect ? "correct" : "wrong"}`}>
          <strong>{session.feedback.isCorrect ? "答对了" : "答错了"}</strong>
          <span>正确答案：{session.feedback.correctAnswer}</span>
          <p>{session.feedback.explanation}</p>
          <small>{session.feedback.nextAction}</small>
          {feedbackWord && <WordLearningCard word={feedbackWord} compact />}
          <button type="button" onClick={session.nextQuestion}>
            {session.questionIndex + 1 >= session.questionTotal ? "查看结果" : "下一题"}
          </button>
        </div>
      )}
    </div>
  );
}

function FeedbackOnlyView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  if (!session.feedback) return <EmptyState title="暂无反馈" body="完成练习后会展示正误、错因和后续处理方式。" action="返回任务页" onAction={session.backHome} />;
  return (
    <div className="vocab-flow">
      <div className={`vocab-feedback ${session.feedback.isCorrect ? "correct" : "wrong"}`}>
        <strong>{session.feedback.isCorrect ? "回答正确" : "需要强化"}</strong>
        <span>正确答案：{session.feedback.correctAnswer}</span>
        <p>{session.feedback.explanation}</p>
        <small>{session.feedback.nextAction}</small>
        <button type="button" onClick={session.nextQuestion}>继续</button>
      </div>
    </div>
  );
}

function WrongBookView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  const activeWrongWords = session.wrongWords.filter((record) => !record.resolved);

  if (!activeWrongWords.length) {
    return <EmptyState title="错词本是空的" body="答错的词会自动进入这里，连续答对后可移出。" action="返回任务页" onAction={session.backHome} />;
  }

  return (
    <div className="vocab-flow">
      <div className="vocab-list-head">
        <div>
          <span className="tiny-label">WRONG WORDS</span>
          <h2>错词强化队列</h2>
        </div>
        <button type="button" onClick={session.startWrongPractice}>
          重新练习
        </button>
      </div>
      <div className="vocab-wrong-list">
        {activeWrongWords.map((record) => (
          <WrongWordItem key={record.itemId} record={record} words={session.words} onResolve={() => session.resolveWrong(record.itemId)} />
        ))}
      </div>
    </div>
  );
}

function ReportView({ session, onDailyComplete }: { session: ReturnType<typeof useVocabularySession>; onDailyComplete: () => void }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const report = session.report;
  if (!report) {
    return <EmptyState title="暂无报告" body="完成一轮学习或复习后会生成报告。" action="返回任务页" onAction={session.backHome} />;
  }

  return (
    <div className="vocab-flow">
      <section className="vocab-report-card">
        <span className="tiny-label">LEARNING REPORT</span>
        <h2>{report.accuracyRate}%</h2>
        <p>今日任务名称 - {report.studentName}</p>
      </section>
      <div className="vocab-task-grid">
        <MetricTile label="新学" value={report.newWordsCount} suffix="词" tone="blue" />
        <MetricTile label="复习" value={report.reviewWordsCount} suffix="词" tone="violet" />
        <MetricTile label="错词" value={report.wrongWordsCount} suffix="词" tone="amber" />
        <MetricTile label="掌握" value={report.masteredWordsCount} suffix="词" tone="green" />
      </div>
      <section className="vocab-plan-detail">
        <span>你已连续学习：22 天</span>
        <span>连续学习：{report.streakDays} 天</span>
        <span>获得积分：{report.pointsEarned} 分</span>
        <span>当前等级：{report.levelName}</span>
        <span>学习建议：{report.suggestion}</span>
        <span>计划调整：{report.adjustmentAdvice}</span>
      </section>
      <section className="vocab-report-card vocab-share-card">
        <span className="tiny-label">HONOR SHARE</span>
        <h3>我今天完成了英语词汇学习</h3>
        <p>新学单词：{report.newWordsCount} 个 · 复习单词：{report.reviewWordsCount} 个 · 正确率：{report.accuracyRate}% · 连续学习：{report.streakDays} 天 · 获得徽章：{report.badgeName}</p>
      </section>
      <button className="vocab-complete-action" type="button" onClick={() => setShareOpen(true)}>
        <span className="vocab-complete-icon">
          <Check size={18} />
        </span>
        <span>
          <strong>完成本轮任务</strong>
          <small>领取成就卡片并记录今日学习</small>
        </span>
        <ChevronRight size={18} />
      </button>
      {shareOpen && (
        <AchievementShareModal
          report={report}
          onClose={() => setShareOpen(false)}
          onShareStart={() => setConfettiVisible(true)}
          onShareDone={() => {
            setShareOpen(false);
            window.setTimeout(() => {
              onDailyComplete();
              session.backHome();
            }, 220);
          }}
        />
      )}
      {confettiVisible && <CelebratingConfetti onDone={() => setConfettiVisible(false)} />}
    </div>
  );
}

function AchievementShareModal({
  report,
  onClose,
  onShareStart,
  onShareDone
}: {
  report: NonNullable<ReturnType<typeof useVocabularySession>["report"]>;
  onClose: () => void;
  onShareStart: () => void;
  onShareDone: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [sharing, setSharing] = useState(false);
  function closeWithFade() {
    setClosing(true);
    window.setTimeout(onClose, 260);
  }

  function shareWithFade() {
    if (sharing) return;
    setSharing(true);
    onShareStart();
    window.setTimeout(() => setClosing(true), 1180);
    window.setTimeout(onShareDone, 1480);
  }

  return (
    <div className={`vocab-share-overlay ${closing ? "closing" : ""}`} role="dialog" aria-modal="true" aria-label="学习成就分享卡">
      <section className="vocab-achievement-card">
        <button className="vocab-share-close" type="button" aria-label="关闭分享卡片" onClick={closeWithFade}>
          <X size={17} />
        </button>
        <div className="vocab-achievement-badge">
          <Sparkles size={20} />
          <span>{report.badgeName}</span>
        </div>
        <div className="vocab-achievement-title">
          <span>今日成就达成</span>
          <h2>我完成了英语词汇学习</h2>
          <p>继续积累，明天更进一步</p>
        </div>
        <div className="vocab-achievement-score">
          <strong>{report.accuracyRate}%</strong>
          <span>今日正确率</span>
        </div>
        <div className="vocab-achievement-stats">
          <span>
            <b>{report.newWordsCount}</b>
            新学单词
          </span>
          <span>
            <b>{report.reviewWordsCount}</b>
            复习单词
          </span>
          <span>
            <b>{report.streakDays}</b>
            连续学习
          </span>
          <span>
            <b>{report.pointsEarned}</b>
            获得积分
          </span>
        </div>
        <div className="vocab-achievement-footer">
          <small>{report.levelName}</small>
          <button type="button" onClick={shareWithFade} disabled={sharing}>
            {sharing ? "分享中" : "分享成就"}
          </button>
        </div>
      </section>
    </div>
  );
}

function SettingsView({ session }: { session: ReturnType<typeof useVocabularySession> }) {
  return (
    <div className="vocab-flow">
      <section className="vocab-report-card">
        <span className="tiny-label">PLAN ADJUSTMENT</span>
        <h2>v{session.plan.version}</h2>
        <p>当前每日新词 {session.plan.dailyNewItems} 个，复习上限 {session.plan.dailyReviewLimit} 个。系统会根据正确率、错词量和复习负荷调整下一轮任务。</p>
      </section>
      <div className="vocab-task-grid">
        <MetricTile label="新词量" value={session.plan.dailyNewItems} suffix="个" tone="blue" />
        <MetricTile label="复习上限" value={session.plan.dailyReviewLimit} suffix="个" tone="violet" />
        <MetricTile label="错词" value={session.wrongWords.filter((item) => !item.resolved).length} suffix="个" tone="amber" />
        <MetricTile label="完成度" value={session.libraryProgress} suffix="%" tone="green" />
      </div>
      <button className="vocab-primary-action" type="button" onClick={session.applyPlanAdjustment}>
        <Settings2 size={18} />
        <span>
          <strong>接受系统调整</strong>
          <small>生成下一轮任务，并更新计划版本</small>
        </span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function WordLearningCard({ word, compact = false }: { word: Word; compact?: boolean }) {
  const [favorite, setFavorite] = useState(false);
  return (
    <section className={`vocab-word-card ${compact ? "compact" : ""}`}>
      <div className="vocab-word-main">
        <div>
          <h2>{word.word}</h2>
          <span>{word.phonetic}</span>
        </div>
        <div className="vocab-word-tools" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" aria-label="播放发音">
            <Volume2 size={18} />
          </button>
          <button className={favorite ? "active" : ""} type="button" aria-label="收藏单词" onClick={() => setFavorite((value) => !value)}>
            <Star size={18} />
          </button>
        </div>
      </div>
      <div className="vocab-definition">
        <strong>{word.meaningCn}</strong>
        <p>{word.meaningEn}</p>
      </div>
      <blockquote>
        {word.example}
        <small>{word.exampleTranslation}</small>
      </blockquote>
      <div className="vocab-memory-box">
        <strong>AI 记忆法</strong>
        <span>{word.metadata.aiMemoryHint ?? "把单词放回场景例句里记忆，并在练习中主动回忆。"}</span>
      </div>
      <div className="vocab-tags">
        {word.scenarioTags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
        {word.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </section>
  );
}

function QuestionCard({
  question,
  answer,
  setAnswer,
  submit,
  disabled
}: {
  question: PracticeQuestion;
  answer: string;
  setAnswer: (answer: string) => void;
  submit: (answer: string) => void;
  disabled: boolean;
}) {
  const typeLabel = question.questionType === "select_meaning" ? "看英文选中文" : question.questionType === "select_word" ? "看中文选英文" : "拼写输入";

  return (
    <section className="vocab-question-card">
      <span className="tiny-label">{typeLabel}</span>
      <h2>{question.prompt}</h2>
      {question.options ? (
        <div className="option-grid refined-options vocab-options">
          {question.options.map((option) => (
            <button key={option} type="button" onClick={() => submit(option)} disabled={disabled}>
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div className="vocab-spelling-row">
          <input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="输入英文单词" disabled={disabled} />
          <button type="button" onClick={() => answer.trim() && submit(answer)} disabled={disabled || !answer.trim()}>
            提交
          </button>
        </div>
      )}
    </section>
  );
}

function WrongWordItem({ record, words, onResolve }: { record: WrongWordRecord; words: Word[]; onResolve: () => void }) {
  const word = words.find((item) => item.id === record.itemId);
  if (!word) return null;
  return (
    <article className="vocab-wrong-item">
      <div>
        <strong>{word.word}</strong>
        <span>{word.meaningCn}</span>
      </div>
      <small>
        错 {record.wrongCount} 次 · {record.errorTypes.join(" / ")} · {formatDate(record.lastWrongAt)}
      </small>
      <button type="button" onClick={onResolve}>
        标记已解决
      </button>
    </article>
  );
}

let previousSetupProgress = 0;

function VocabularySetupSteps({ current }: { current: "goal" | "scenario" | "book" | "preference" | "plan" }) {
  const steps = [
    { id: "goal", label: "目标" },
    { id: "scenario", label: "场景" },
    { id: "book", label: "词库" },
    { id: "preference", label: "偏好" },
    { id: "plan", label: "计划" }
  ] as const;
  const currentIndex = steps.findIndex((step) => step.id === current);
  const progress = steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 0;
  const [progressFrom] = useState(previousSetupProgress);

  useEffect(() => {
    previousSetupProgress = progress;
  }, [progress]);

  return (
    <div
      className="vocab-setup-steps"
      style={{ "--step-progress": `${progress}%`, "--step-progress-from": `${progressFrom}%` } as CSSProperties & Record<"--step-progress" | "--step-progress-from", string>}
      aria-label="背单词初始化流程"
    >
      {steps.map((step, index) => (
        <span className={index < currentIndex ? "done" : index === currentIndex ? "active" : ""} key={step.id}>
          <i>{index + 1}</i>
          {step.label}
        </span>
      ))}
    </div>
  );
}

export function CelebratingConfetti({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1400);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="vocab-confetti-layer" aria-hidden="true">
      <svg className="vocab-confetti-svg" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        <g className="confetti-cone">
          <path className="conf0" d="M131.5,172.6L196,343c2.3,6.1,11,6.1,13.4,0l65.5-170.7L131.5,172.6z" />
          <path className="conf1" d="M131.5,172.6L196,343c2.3,6.1,11,6.1,13.4,0l6.7-17.5l-53.6-152.9L131.5,172.6z" />
          <path className="conf2" d="M274.2,184.2c-1.8,1.8-4.2,2.9-7,2.9l-129.5,0.4c-5.4,0-9.8-4.4-9.8-9.8c0-5.4,4.4-9.8,9.9-9.9l129.5-0.4c5.4,0,9.8,4.4,9.8,9.8C277,180,275.9,182.5,274.2,184.2z" />
          <polygon className="conf3" points="231.5,285.4 174.2,285.5 143.8,205.1 262.7,204.7" />
          <path className="conf4" d="M166.3,187.4l-28.6,0.1c-5.4,0-9.8-4.4-9.8-9.8c0-5.4,4.4-9.8,9.9-9.9l24.1-0.1c0,0-2.6,5-1.3,10.6C161.8,183.7,166.3,187.4,166.3,187.4z" />
          <ellipse className="conf2" cx="233.9" cy="224" rx="5.6" ry="5.6" />
          <path className="conf5" d="M143.8,205.1l5.4,14.3c6.8-2.1,14.4-0.5,19.7,4.8c7.7,7.7,7.6,20.1-0.1,27.8c-1.7,1.7-3.7,3-5.8,4l11.1,29.4l27.7,0l-28-80.5L143.8,205.1z" />
          <path className="conf2" d="M169,224.2c-5.3-5.3-13-6.9-19.7-4.8l13.9,36.7c2.1-1,4.1-2.3,5.8-4C176.6,244.4,176.6,231.9,169,224.2z" />
          <ellipse className="conf6" cx="207.4" cy="254.3" rx="11.3" ry="11.2" />
        </g>
        <circle className="conf2" id="b1" cx="195.2" cy="232.6" r="5.1" />
        <circle className="conf0" id="b2" cx="230.8" cy="219.8" r="5.4" />
        <circle className="conf0" id="c2" cx="178.9" cy="160.4" r="4.2" />
        <circle className="conf6" id="d2" cx="132.8" cy="123.6" r="5.4" />
        <circle className="conf0" id="d3" cx="151.9" cy="105.1" r="5.4" />
        <path className="conf0" id="d1" d="M129.9,176.1l-5.7,1.3c-1.6,0.4-2.2,2.3-1.1,3.5l3.8,4.2c1.1,1.2,3.1,0.8,3.6-0.7l1.9-5.5C132.9,177.3,131.5,175.7,129.9,176.1z" />
        <path className="conf6" id="b5" d="M284.5,170.7l-5.4,1.2c-1.5,0.3-2.1,2.2-1,3.3l3.6,3.9c1,1.1,2.9,0.8,3.4-0.7l1.8-5.2C287.4,171.9,286.1,170.4,284.5,170.7z" />
        <circle className="conf6" id="c3" cx="206.7" cy="144.4" r="4.5" />
        <path className="conf2" id="c1" d="M176.4,192.3h-3.2c-1.6,0-2.9-1.3-2.9-2.9v-3.2c0-1.6,1.3-2.9,2.9-2.9h3.2c1.6,0,2.9,1.3,2.9,2.9v3.2C179.3,191,178,192.3,176.4,192.3z" />
        <path className="conf2" id="b4" d="M263.7,197.4h-3.2c-1.6,0-2.9-1.3-2.9-2.9v-3.2c0-1.6,1.3-2.9,2.9-2.9h3.2c1.6,0,2.9,1.3,2.9,2.9v3.2C266.5,196.1,265.2,197.4,263.7,197.4z" />
        <path className="conf8 yellow-strip" d="M179.7,102.4c0,0,6.6,15.3-2.3,25c-8.9,9.7-24.5,9.7-29.7,15.6c-5.2,5.9-0.7,18.6,3.7,28.2c4.5,9.7,2.2,23-10.4,28.2" />
        <path className="conf8 yellow-strip" d="M252.2,156.1c0,0-16.9-3.5-28.8,2.4c-11.9,5.9-14.9,17.8-16.4,29c-1.5,11.1-4.3,28.8-31.5,33.4" />
        <path className="conf0" id="a1" d="M277.5,254.8h-3.2c-1.6,0-2.9-1.3-2.9-2.9v-3.2c0-1.6,1.3-2.9,2.9-2.9h3.2c1.6,0,2.9,1.3,2.9,2.9v3.2C280.4,253.5,279.1,254.8,277.5,254.8z" />
        <path className="conf3" id="c4" d="M215.2,121.3c0.3,0.6,0.8,1,1.5,1.1c1.6,0.2,2.2,2.2,1.1,3.3c-0.5,0.4-0.7,1.1-0.6,1.7c0.3,1.6-1.4,2.8-2.8,2c-0.6-0.3-1.2-0.3-1.8,0c-1.4,0.7-3.1-0.5-2.8-2c0.1-0.6-0.1-1.3-0.6-1.7c-1.1-1.1-0.5-3.1,1.1-3.3c0.6-0.1,1.2-0.5,1.5-1.1C212.5,119.8,214.5,119.8,215.2,121.3z" />
        <path className="conf3" id="b3" d="M224.5,191.7c0.3,0.6,0.8,1,1.5,1.1c1.6,0.2,2.2,2.2,1.1,3.3c-0.5,0.4-0.7,1.1-0.6,1.7c0.3,1.6-1.4,2.8-2.8,2c-0.6-0.3-1.2-0.3-1.8,0c-1.4,0.7-3.1-0.5-2.8-2c0.1-0.6-0.1-1.3-0.6-1.7c-1.1-1.1-0.5-3.1,1.1-3.3c0.6-0.1,1.2-0.5,1.5-1.1C221.7,190.2,223.8,190.2,224.5,191.7z" />
        <path className="conf3" id="a2" d="M312.6,242.1c0.3,0.6,0.8,1,1.5,1.1c1.6,0.2,2.2,2.2,1.1,3.3c-0.5,0.4-0.7,1.1-0.6,1.7c0.3,1.6-1.4,2.8-2.8,2c-0.6-0.3-1.2-0.3-1.8,0c-1.4,0.7-3.1-0.5-2.8-2c0.1-0.6-0.1-1.3-0.6-1.7c-1.1-1.1-0.5-3.1,1.1-3.3c0.6-0.1,1.2-0.5,1.5-1.1C309.9,240.6,311.9,240.6,312.6,242.1z" />
        <path className="conf8 yellow-strip" d="M290.7,215.4c0,0-14.4-3.4-22.6,2.7c-8.2,6.2-8.2,23.3-17.1,29.4c-8.9,6.2-19.8-2.7-32.2-4.1c-12.3-1.4-19.2,5.5-20.5,10.9" />
      </svg>
    </div>
  );
}

function PlanGeneratingOverlay() {
  return (
    <div className="vocab-loading-overlay" role="status" aria-live="polite">
      <div className="vocab-loading-card">
        <div className="loader-holder" aria-hidden="true">
          <div className="blob-big" />
          <div className="blob-1" />
          <div className="blob-2" />
          <div className="blob-3" />
          <div className="blob-4" />
          <div className="blob-5" />
        </div>
        <strong>正在生成学习计划</strong>
        <span>系统正在安排新词、复习、错词强化和今日报告</span>
      </div>
      <svg className="vocab-goo-filter" xmlns="http://www.w3.org/2000/svg" version="1.1" aria-hidden="true">
        <defs>
          <filter id="vocab-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

function SetupActionBar({
  primaryIcon,
  primaryLabel,
  primaryHint,
  onPrimary,
  backLabel,
  onBack,
  disabled = false
}: {
  primaryIcon: ReactNode;
  primaryLabel: string;
  primaryHint: string;
  onPrimary: () => void;
  backLabel: string;
  onBack: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="vocab-step-actions">
      <button className="vocab-step-back" type="button" onClick={onBack} disabled={disabled}>
        <ArrowLeft size={17} />
        <span>{backLabel}</span>
      </button>
      <button className="vocab-step-next" type="button" onClick={onPrimary} disabled={disabled}>
        {primaryIcon}
        <span>
          <strong>{primaryLabel}</strong>
          <small>{primaryHint}</small>
        </span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function SetupSection({ icon, title, desc, children }: { icon: ReactNode; title: string; desc: string; children: ReactNode }) {
  return (
    <section className="vocab-setup-section">
      <div className="vocab-setup-title">
        <span>{icon}</span>
        <div>
          <strong>{title}</strong>
          <small>{desc}</small>
        </div>
      </div>
      {children}
    </section>
  );
}

function ChoiceGrid({ children }: { children: ReactNode }) {
  return <div className="vocab-choice-pills">{children}</div>;
}

function MetricTile({ label, value, suffix, tone }: { label: string; value: number; suffix: string; tone: "blue" | "violet" | "amber" | "green" }) {
  return (
    <div className={`vocab-metric ${tone}`}>
      <span>{label}</span>
      <strong>
        {value}
        <small>{suffix}</small>
      </strong>
    </div>
  );
}

function ProgressHeader({ label, current, total, progress }: { label: string; current: number; total: number; progress?: number }) {
  return (
    <div className="vocab-progress-head">
      <div>
        <span className="tiny-label">{label}</span>
        <strong>
          {current}/{Math.max(total, 1)}
        </strong>
      </div>
      <div className="vocab-progress-track">
        <i style={{ width: `${progress ?? Math.round((current / Math.max(total, 1)) * 100)}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return (
    <div className="vocab-empty">
      <Clock3 size={28} />
      <strong>{title}</strong>
      <p>{body}</p>
      <button type="button" onClick={onAction}>
        {action}
      </button>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function goalLabel(goal: VocabularyGoal) {
  const labels: Record<VocabularyGoal, string> = {
    cet4: "四级",
    cet6: "六级",
    postgraduate: "考研",
    ielts: "雅思",
    toefl: "托福",
    business: "商务英语",
    daily: "日常英语",
    reading: "阅读提升",
    course: "课程学习",
    custom: "自定义目标"
  };
  return labels[goal];
}

function levelLabel(level: VocabularyLevel) {
  const labels: Record<VocabularyLevel, string> = {
    starter: "入门",
    basic: "基础",
    intermediate: "进阶",
    advanced: "冲刺"
  };
  return labels[level];
}

function preferenceLabel(preference: LearningPreference) {
  const labels: Record<LearningPreference, string> = {
    memory: "记忆优先",
    spelling: "拼写优先",
    listening: "听力优先",
    example: "例句优先",
    exam: "考试优先",
    reading: "阅读优先",
    speaking: "口语优先",
    business: "商务优先"
  };
  return labels[preference];
}

function difficultyLabel(difficulty: Word["difficulty"]) {
  const labels: Record<Word["difficulty"], string> = {
    easy: "低",
    medium: "中",
    hard: "高"
  };
  return labels[difficulty];
}
