"use client";

import type { SpeechEvaluationResult } from "@/lib/ai/types";
import { VocabularyLearningModule } from "@/features/vocabulary/vocabulary-learning-module";
import type { SeedData } from "@/lib/domain";
import type { EChartsType } from "echarts";
import type { CSSProperties } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Bot,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  Gift,
  GraduationCap,
  Home,
  LockKeyhole,
  Mic,
  Play,
  QrCode,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
  Users,
  Volume2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AIOrbButton } from "./ai-orb-button";
import { CircleAdBanner } from "./circle-ad-banner";
import { ThemeToggle } from "./theme-toggle";

type MiniTab = "study" | "circle" | "ai" | "content" | "plan" | "events";
type StudyMode = "overview" | "speech" | "vocab";
type CalendarScope = "day" | "week" | "month" | "quarter" | "year";
type DockKey = "home" | "circle" | "ai" | "ziku" | "mine";
type CircleFilter = "all" | "note" | "event" | "resource";
type DayTaskKind = "speech" | "vocab" | "review" | "share";
type MiniAudience = "student" | "parent" | "visitor";
type TodayCheckin = {
  speechDone: boolean;
  vocabDone: boolean;
  speechScore: number;
  wordsDone: number;
  targetWords: number;
};

const transcript = "I usually go to school by bus and read English after class";
const calendarRecords = new Map([
  [1, { speech: 1, vocab: 18, score: 86 }],
  [2, { speech: 1, vocab: 20, score: 89 }],
  [4, { speech: 1, vocab: 20, score: 91 }],
  [5, { speech: 2, vocab: 20, score: 88 }],
  [6, { speech: 1, vocab: 24, score: 94 }],
  [7, { speech: 1, vocab: 18, score: 93 }],
  [12, { speech: 1, vocab: 20, score: 90 }],
  [13, { speech: 0, vocab: 22, score: 0 }],
  [15, { speech: 1, vocab: 20, score: 92 }]
]);
const calendarScopeTabs: Array<{ id: CalendarScope; label: string }> = [
  { id: "day", label: "日" },
  { id: "week", label: "周" },
  { id: "month", label: "月" },
  { id: "quarter", label: "季" },
  { id: "year", label: "年" }
];
const weekRecords = [
  { label: "一", date: "05/04", speech: 1, vocab: 20, score: 91 },
  { label: "二", date: "05/05", speech: 2, vocab: 20, score: 88 },
  { label: "三", date: "05/06", speech: 1, vocab: 24, score: 94 },
  { label: "四", date: "05/07", speech: 1, vocab: 18, score: 93 },
  { label: "五", date: "05/08", speech: 0, vocab: 12, score: 0 },
  { label: "六", date: "05/09", speech: 0, vocab: 0, score: 0 },
  { label: "日", date: "05/10", speech: 0, vocab: 0, score: 0 }
];
const quarterRecords = [
  { season: "春季", months: "1-3月", speech: 28, vocab: 660, activeDays: 42, rate: 68, status: "past", share: 12, review: 9 },
  { season: "夏季", months: "4-6月", speech: 27, vocab: 602, activeDays: 30, rate: 52, status: "current", share: 8, review: 7 },
  { season: "秋季", months: "7-9月", speech: 0, vocab: 0, activeDays: 0, rate: 0, status: "future", share: 0, review: 0 },
  { season: "冬季", months: "10-12月", speech: 0, vocab: 0, activeDays: 0, rate: 0, status: "future", share: 0, review: 0 }
];
const yearRecords = [
  { month: "1月", rate: 48 },
  { month: "2月", rate: 58 },
  { month: "3月", rate: 64 },
  { month: "4月", rate: 72 },
  { month: "5月", rate: 46 },
  { month: "6月", rate: 12 },
  { month: "7月", rate: 0 },
  { month: "8月", rate: 0 },
  { month: "9月", rate: 0 },
  { month: "10月", rate: 0 },
  { month: "11月", rate: 0 },
  { month: "12月", rate: 0 }
];
const roseColors = ["#11009E", "#4942E4", "#8696FE", "#AA77FF", "#C4B0FF", "#C9EEFF", "#97DEFF", "#62CDFF"];
const calendarBaseDate = new Date(2026, 4, 8);
const circleItems = [
  { type: "note", title: "初三听口最后 30 天训练节奏", tag: "笔记文章", pay: "免费", tone: "violet", height: "tall", image: "/community/speaking-lab.svg" },
  { type: "event", title: "台州中考冲刺线下讲座", tag: "线下活动", pay: "报名", tone: "amber", height: "mid", image: "/community/live-lecture.svg" },
  { type: "resource", title: "历年真题 PDF 合集", tag: "资料", pay: "付费", tone: "blue", height: "mid", image: "/community/resource-pack.svg" },
  { type: "note", title: "雅思口语 7 分表达替换", tag: "笔记文章", pay: "付费", tone: "green", height: "short", image: "/community/ielts-notes.svg" },
  { type: "event", title: "线上公开课：阅读提速", tag: "线上活动", pay: "免费", tone: "violet", height: "short", image: "/community/online-class.svg" },
  { type: "resource", title: "核心词汇表 1200", tag: "资料", pay: "免费", tone: "amber", height: "tall", image: "/community/vocab-cards.svg" },
  { type: "note", title: "英语作文高级句型卡片", tag: "笔记文章", pay: "免费", tone: "blue", height: "mid", image: "/community/writing-cards.svg" },
  { type: "resource", title: "剑桥听力训练库", tag: "资料", pay: "付费", tone: "violet", height: "short", image: "/community/listening-bank.svg" },
  { type: "event", title: "外教口语线上营", tag: "线上活动", pay: "报名", tone: "green", height: "tall", image: "/community/ai-speaking.svg" },
  { type: "note", title: "本地升学政策快速读懂", tag: "笔记文章", pay: "免费", tone: "amber", height: "mid", image: "/community/policy-map.svg" },
  { type: "resource", title: "学霸错题复盘模板", tag: "资料", pay: "免费", tone: "green", height: "short", image: "/community/review-template.svg" },
  { type: "event", title: "线下模考诊断日", tag: "线下活动", pay: "报名", tone: "blue", height: "mid", image: "/community/mock-test.svg" },
  { type: "note", title: "托福阅读长难句拆解", tag: "笔记文章", pay: "付费", tone: "violet", height: "tall", image: "/community/reading-map.svg" },
  { type: "resource", title: "中考听口高频题型包", tag: "资料", pay: "付费", tone: "amber", height: "mid", image: "/community/exam-pack.svg" },
  { type: "event", title: "家长升学规划沙龙", tag: "线下活动", pay: "免费", tone: "green", height: "short", image: "/community/parent-salon.svg" },
  { type: "note", title: "每日 15 分钟背词法", tag: "笔记文章", pay: "免费", tone: "blue", height: "short", image: "/community/daily-vocab.svg" }
] as const;

export function MiniExperience({ seed, audience = "student" }: { seed: SeedData; audience?: MiniAudience }) {
  const [tab, setTab] = useState<MiniTab>(audience === "visitor" ? "circle" : "study");
  const [studyMode, setStudyMode] = useState<StudyMode>("overview");
  const [dockKey, setDockKey] = useState<DockKey>(audience === "visitor" ? "circle" : "home");
  const [aiOpen, setAiOpen] = useState(false);
  const [circleFilter, setCircleFilter] = useState<CircleFilter>("all");
  const [scope, setScope] = useState<CalendarScope>("day");
  const [evaluation, setEvaluation] = useState<SpeechEvaluationResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [voucherCount, setVoucherCount] = useState(1);
  const [todayCheckin, setTodayCheckin] = useState<TodayCheckin>({
    speechDone: true,
    vocabDone: false,
    speechScore: 93,
    wordsDone: 12,
    targetWords: 18
  });
  const roleByAudience = {
    student: "STUDENT",
    parent: "PARENT",
    visitor: "VISITOR"
  } as const;
  const currentUser = seed.users.find((user) => user.role === roleByAudience[audience]) ?? seed.users[0]!;
  const gatedResource = useMemo(
    () => seed.resources.find((resource) => resource.accessRule.condition === "PHONE_AUTH_REQUIRED"),
    [seed.resources]
  );

  async function runEvaluation() {
    setEvaluating(true);
    const response = await fetch("/api/ai/evaluate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ taskId: "res_task_speech_001", transcript })
    });
    const result = (await response.json()) as SpeechEvaluationResult;
    setEvaluation(result);
    setTodayCheckin((current) => ({ ...current, speechDone: true, speechScore: result.score }));
    setEvaluating(false);
  }

  function switchTab(nextTab: MiniTab, nextDock?: DockKey) {
    setTab(nextTab);
    setStudyMode("overview");
    if (nextDock) {
      setDockKey(nextDock);
    }
  }

  return (
    <main className="mobile-stage">
      <section className="phone-shell redesigned-phone">
        <header className="mini-appbar">
          <button className="avatar-button" type="button" aria-label="打开个人中心">
            {currentUser.profile.avatar}
          </button>
          <div className="mini-search">
            <Search size={16} />
            <span>{audience === "visitor" ? "搜索资料、讲座、规划" : audience === "parent" ? "搜索学情、卡券、资料" : "搜索真题、讲座、任务"}</span>
          </div>
          <ThemeToggle />
        </header>

        <div className="mini-content-area">
          <AnimatePresence mode="wait">
            {tab === "study" && studyMode === "overview" && (
              <MotionScreen key="study-overview">
                <StudyOverview
                  audience={audience}
                  scope={scope}
                  setScope={setScope}
                  todayCheckin={todayCheckin}
                  openTask={setStudyMode}
                  completeCheckin={() =>
                    setTodayCheckin((current) => ({
                      ...current,
                      speechDone: true,
                      vocabDone: true,
                      wordsDone: current.targetWords
                    }))
                  }
                />
              </MotionScreen>
            )}
            {tab === "study" && studyMode === "speech" && (
              <MotionScreen key="speech">
                <SpeechTask
                  evaluation={evaluation}
                  evaluating={evaluating}
                  runEvaluation={runEvaluation}
                  onBack={() => setStudyMode("overview")}
                />
              </MotionScreen>
            )}
            {tab === "study" && studyMode === "vocab" && (
              <MotionScreen key="vocab">
                <VocabularyLearningModule
                  userId={currentUser.id}
                  onBack={() => setStudyMode("overview")}
                  onDailyComplete={(summary) =>
                    setTodayCheckin((current) => ({
                      ...current,
                      vocabDone: true,
                      wordsDone: Math.max(current.wordsDone, current.targetWords)
                    }))
                  }
                />
              </MotionScreen>
            )}
            {tab === "plan" && (
              <MotionScreen key="plan">
                <PlanPage />
              </MotionScreen>
            )}
            {tab === "circle" && (
              <MotionScreen key="circle">
                <CirclePage filter={circleFilter} setFilter={setCircleFilter} />
              </MotionScreen>
            )}
            {tab === "content" && (
              <MotionScreen key="content">
                <ContentPage
                  title={gatedResource?.metadata.title ?? "雅思提分攻略"}
                  summary={gatedResource?.metadata.summary ?? ""}
                  authorized={authorized}
                  setAuthorized={setAuthorized}
                  voucherCount={voucherCount}
                  setVoucherCount={setVoucherCount}
                />
              </MotionScreen>
            )}
            {tab === "events" && (
              <MotionScreen key="events">
                <EventsPage />
              </MotionScreen>
            )}
          </AnimatePresence>
        </div>

        {!aiOpen && (
          <nav className="mini-dock" aria-label="应用底部导航">
            <DockItem icon={Home} label="首页" active={dockKey === "home"} onClick={() => switchTab("study", "home")} />
            <DockItem icon={Users} label="圈子" active={dockKey === "circle"} onClick={() => switchTab("circle", "circle")} />
            <AIOrbButton onClick={() => setAiOpen(true)} />
            <DockItem icon={FileText} label="资库" active={dockKey === "ziku"} onClick={() => switchTab("content", "ziku")} />
            <DockItem icon={UserRound} label="我的" active={dockKey === "mine"} onClick={() => switchTab("plan", "mine")} />
          </nav>
        )}

        <AnimatePresence>
          {aiOpen && <AIChatPage onClose={() => setAiOpen(false)} />}
        </AnimatePresence>
      </section>
    </main>
  );
}

function MotionScreen({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function DockItem({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={active ? "active" : ""} type="button" onClick={onClick}>
      <span className="dock-icon-wrap">
        <Icon size={21} strokeWidth={2.35} />
      </span>
      <span>{label}</span>
      <i className="dock-dot" aria-hidden="true" />
    </button>
  );
}

function StudyOverview({
  audience,
  scope,
  setScope,
  todayCheckin,
  openTask,
  completeCheckin
}: {
  audience: MiniAudience;
  scope: CalendarScope;
  setScope: (scope: CalendarScope) => void;
  todayCheckin: TodayCheckin;
  openTask: (mode: StudyMode) => void;
  completeCheckin: () => void;
}) {
  return (
    <section className="study-home">
      <TodayCheckinHero audience={audience} todayCheckin={todayCheckin} completeCheckin={completeCheckin} />

      <div className="scope-switch">
        {calendarScopeTabs.map(({ id, label }) => (
          <button key={id} className={scope === id ? "active" : ""} type="button" onClick={() => setScope(id)}>
            {scope === id && <motion.span className="scope-pill" layoutId="scope-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span>{label}</span>
          </button>
        ))}
      </div>

      <LearningCalendar scope={scope} openTask={openTask} />

      <div className="period-grid">
        {getPeriodMetrics(scope).map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>

      <div className="task-entry-list">
        <button type="button" onClick={() => openTask("speech")}>
          <span className="entry-icon speech">
            <Mic size={20} />
          </span>
          <div>
            <strong>口语练习</strong>
            <small>AI 音素级评分、红黄绿纠错、录音复盘</small>
          </div>
          <ChevronRight size={18} />
        </button>
        <button type="button" onClick={() => openTask("vocab")}>
          <span className="entry-icon vocab">
            <BookOpen size={20} />
          </span>
          <div>
            <strong>词汇学习</strong>
            <small>每日词书计划、看英选汉、错词强制复习</small>
          </div>
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

function TodayCheckinHero({
  audience,
  todayCheckin,
  completeCheckin
}: {
  audience: MiniAudience;
  todayCheckin: TodayCheckin;
  completeCheckin: () => void;
}) {
  const isComplete = todayCheckin.speechDone && todayCheckin.vocabDone;
  const roleLabel = audience === "parent" ? "Child Check-in" : audience === "visitor" ? "Trial Check-in" : "Today Check-in";
  const title = isComplete ? (audience === "parent" ? "孩子今日打卡已完成" : "今日打卡已完成") : "今日打卡还未完成";
  const description = isComplete ? "今日学习已入账，日历会保留这次完成记录。" : "口语练习和词汇学习都完成后，才算当天打卡完成。";

  return (
    <div className="study-hero checkin-hero">
      <CalendarClockBadge />
      <div className="checkin-copy">
        <span className="tiny-label">{roleLabel}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="checkin-lower">
        <div className="checkin-left">
          <div className="checkin-status-row" aria-label="今日打卡状态">
            <span className={todayCheckin.speechDone ? "done" : "pending"}>
              <Mic size={15} />
              口语
            </span>
            <span className={todayCheckin.vocabDone ? "done" : "pending"}>
              <BookOpen size={15} />
              词汇
            </span>
          </div>
        </div>
        <HoldCheckinButton done={isComplete} onComplete={completeCheckin} />
      </div>
    </div>
  );
}

function CalendarClockBadge() {
  const [now, setNow] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState(false);
  const viewDate = now ?? new Date(2026, 4, 10, 9, 30);
  const month = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"][
    viewDate.getMonth()
  ];
  const day = String(viewDate.getDate()).padStart(2, "0");
  const week = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][viewDate.getDay()];
  const hour = String(viewDate.getHours()).padStart(2, "0");
  const minute = String(viewDate.getMinutes()).padStart(2, "0");
  const second = String(viewDate.getSeconds()).padStart(2, "0");
  const year = String(viewDate.getFullYear());

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <button
      className={`calendar-signboard ${expanded ? "expanded" : ""}`}
      type="button"
      aria-label="展开当前日期"
      aria-pressed={expanded}
      onClick={() => setExpanded((value) => !value)}
    >
      <div className="signboard-card signboard-left" aria-hidden="true">
        <span className="clock-value">{hour}</span>
        <span className="calendar-normal day2">{week}</span>
      </div>
      <div className="signboard-card signboard-right" aria-hidden="true">
        <span className="clock-value">{second}</span>
        <span className="calendar-normal month2">{month}</span>
      </div>
      <div className="signboard-card signboard-front">
        <span className="calendar-year">{year}</span>
        <span className="calendar-clock-minute">{minute}</span>
        <span className="calendar-date2">{day}</span>
        <span className="calendar-main">
          <span className="calendar-month">{month}</span>
          <strong className="calendar-date">{day}</strong>
          <span className="calendar-day">{week}</span>
        </span>
      </div>
    </button>
  );
}

function HoldCheckinButton({ done, onComplete }: { done: boolean; onComplete: () => void }) {
  const duration = 1600;
  const [state, setState] = useState<"idle" | "process" | "success">(done ? "success" : "idle");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setState(done ? "success" : "idle");
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [done]);

  function startHold() {
    if (done || state === "success" || timerRef.current) {
      return;
    }
    setState("process");
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setState("success");
      onComplete();
    }, duration);
  }

  function cancelHold() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!done && state === "process") {
      setState("idle");
    }
  }

  return (
    <button
      className={`button-hold ${state === "process" ? "process" : ""} ${state === "success" ? "success" : ""}`}
      style={{ "--duration": `${duration}ms` } as CSSProperties}
      type="button"
      aria-label={done ? "今日已打卡" : "长按完成今日打卡"}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          startHold();
        }
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          cancelHold();
        }
      }}
    >
      <span className="hold-icon" aria-hidden="true">
        <svg className="progress" viewBox="0 0 32 32">
          <circle r="8" cx="16" cy="16" />
        </svg>
        <svg className="tick" viewBox="0 0 24 24">
          <polyline points="18,7 11,16 6,12" />
        </svg>
      </span>
      <ul>
        <li>打卡</li>
        <li>加油</li>
        <li>完成</li>
      </ul>
    </button>
  );
}

function getPeriodMetrics(scope: CalendarScope) {
  const metrics: Record<CalendarScope, Array<{ label: string; value: string }>> = {
    day: [
      { label: "今日口语", value: "1次" },
      { label: "今日词汇", value: "18" },
      { label: "AI 得分", value: "93" }
    ],
    week: [
      { label: "口语均分", value: "91.5" },
      { label: "背词完成率", value: "86%" },
      { label: "错词复习", value: "12" }
    ],
    month: [
      { label: "本月打卡", value: "9天" },
      { label: "累计词汇", value: "182" },
      { label: "满分任务", value: "3" }
    ],
    quarter: [
      { label: "季度活跃", value: "30天" },
      { label: "季度词汇", value: "602" },
      { label: "分享解锁", value: "2" }
    ],
    year: [
      { label: "年度学习", value: "92天" },
      { label: "年度词汇", value: "1680" },
      { label: "最高连击", value: "14天" }
    ]
  };
  return metrics[scope];
}

function LearningCalendar({ scope, openTask }: { scope: CalendarScope; openTask: (mode: StudyMode) => void }) {
  const [periodOffsets, setPeriodOffsets] = useState<Record<CalendarScope, number>>({
    day: 0,
    week: 0,
    month: 0,
    quarter: 0,
    year: 0
  });
  const periodOffset = periodOffsets[scope];
  const canNavigate = scope === "day" || scope === "week" || scope === "month";
  const monthDate = new Date(calendarBaseDate.getFullYear(), calendarBaseDate.getMonth() + periodOffset, 1);
  const days = Array.from({ length: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate() }, (_, index) => index + 1);
  const leadingBlankDays = monthDate.getDay();
  const scopeCopy = getCalendarCopy(scope, periodOffset);

  function shiftPeriod(delta: number) {
    setPeriodOffsets((current) => ({
      ...current,
      [scope]: current[scope] + delta
    }));
  }

  return (
    <div className="calendar-board polished-calendar">
      <div className="calendar-head">
        <div>
          <strong>{scopeCopy.title}</strong>
          {scopeCopy.subtitle && <span>{scopeCopy.subtitle}</span>}
        </div>
        {canNavigate ? (
          <div className="calendar-nav" aria-label="周期切换">
            <button type="button" aria-label="上一段" onClick={() => shiftPeriod(-1)}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" aria-label="下一段" onClick={() => shiftPeriod(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <button className="calendar-insight" type="button" aria-label="查看统计">
            <BarChart3 size={17} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scope}
          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(5px)" }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          {scope === "day" && <DayCalendarView periodOffset={periodOffset} openTask={openTask} />}
          {scope === "week" && <WeekCalendarView periodOffset={periodOffset} openTask={openTask} />}
          {scope === "month" && <MonthCalendarView days={days} leadingBlankDays={leadingBlankDays} monthDate={monthDate} openTask={openTask} />}
          {scope === "quarter" && <QuarterCalendarView openTask={openTask} />}
          {scope === "year" && <YearCalendarView openTask={openTask} />}
        </motion.div>
      </AnimatePresence>

      {scope !== "year" && (
        <div className="calendar-legend">
          <span>
            <b className="speech-dot" />
            口语
          </span>
          <span>
            <b className="vocab-dot" />
            词汇
          </span>
          <span>
            <b className="review-dot" />
            评语
          </span>
          <span>
            <b className="share-dot" />
            分享
          </span>
        </div>
      )}
    </div>
  );
}

function getCalendarCopy(scope: CalendarScope, offset: number) {
  if (scope === "day") {
    const date = new Date(calendarBaseDate);
    date.setDate(calendarBaseDate.getDate() + offset);
    return {
      title: `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`,
      subtitle: offset === 0 ? "今日 2 个任务 · 预计 18 分钟完成" : `${offset > 0 ? "未来" : "历史"}日程 · 可查看学习安排`
    };
  }

  if (scope === "week") {
    const start = new Date(calendarBaseDate);
    start.setDate(calendarBaseDate.getDate() - ((calendarBaseDate.getDay() + 6) % 7) + offset * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      title: `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`,
      subtitle: offset === 0 ? "本周 4 天有学习记录 · 周完成率 71%" : `${offset > 0 ? "下一周" : "上一周"}学习概览`
    };
  }

  if (scope === "month") {
    const date = new Date(calendarBaseDate.getFullYear(), calendarBaseDate.getMonth() + offset, 1);
    return {
      title: `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`,
      subtitle: offset === 0 ? "连续打卡 4 天 · 9 天有学习记录" : `${date.getMonth() + 1} 月月历 · 点击记录进入任务`
    };
  }

  if (scope === "quarter") {
    return { title: "2026 四季学习", subtitle: "四季节点用状态图示区分进度" };
  }

  return { title: "2026 年", subtitle: "" };
}

function DayCalendarView({ periodOffset, openTask }: { periodOffset: number; openTask: (mode: StudyMode) => void }) {
  const isCurrent = periodOffset === 0;
  const tasks: Array<{ time: string; title: string; meta: string; mode: StudyMode; kind: DayTaskKind; done: boolean }> = [
    { time: "07:40", title: isCurrent ? "晨读口语跟读" : "口语跟读计划", meta: isCurrent ? "AI 评分 93 · 用时 6 分钟" : "预计 6 分钟 · 跟读短文", mode: "speech", kind: "speech", done: isCurrent },
    { time: "19:20", title: "核心词汇 18 词", meta: isCurrent ? "已完成 12/18 · 错词 3 个" : "计划 18 词 · 自动复习错词", mode: "vocab", kind: "vocab", done: false },
    { time: "21:10", title: "老师评语复盘", meta: isCurrent ? "等待老师补充反馈" : "复盘最近一次 AI 纠音结果", mode: "speech", kind: "review", done: false },
    { time: "21:30", title: "成绩海报分享", meta: isCurrent ? "满分后可解锁听力资料库" : "完成高分任务后触发", mode: "speech", kind: "share", done: false }
  ];

  return (
    <div className="day-agenda">
      {tasks.map((item) => (
        <button className={`${item.kind} ${item.done ? "done" : ""}`} key={item.time} type="button" onClick={() => openTask(item.mode)}>
          <time>{item.time}</time>
          <div>
            <strong>{item.title}</strong>
            <span>{item.meta}</span>
          </div>
          <ChevronRight size={16} />
        </button>
      ))}
    </div>
  );
}

function WeekCalendarView({ periodOffset, openTask }: { periodOffset: number; openTask: (mode: StudyMode) => void }) {
  const weekStart = new Date(calendarBaseDate);
  weekStart.setDate(calendarBaseDate.getDate() - ((calendarBaseDate.getDay() + 6) % 7) + periodOffset * 7);
  return (
    <div className="week-list">
      {weekRecords.map((day, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        const done = day.speech > 0 || day.vocab > 0;
        const active = periodOffset === 0 && done;
        return (
          <button className={active ? "done" : ""} key={day.label} type="button" onClick={() => active && openTask(day.vocab >= 20 ? "vocab" : "speech")}>
            <span className="week-date">
              <strong>{day.label}</strong>
              <small>{date.getMonth() + 1}/{date.getDate()}</small>
            </span>
            <span className="week-progress">
              <b>{active ? `${day.speech} 次口语 · ${day.vocab} 词` : periodOffset > 0 ? "待安排" : "无记录"}</b>
              <i>
                <em style={{ width: `${active ? Math.min(100, day.vocab * 3 + day.speech * 14) : 0}%` }} />
              </i>
            </span>
            <span className="week-score">{active && day.score > 0 ? day.score : "--"}</span>
          </button>
        );
      })}
    </div>
  );
}

function MonthCalendarView({
  days,
  leadingBlankDays,
  monthDate,
  openTask
}: {
  days: number[];
  leadingBlankDays: number;
  monthDate: Date;
  openTask: (mode: StudyMode) => void;
}) {
  const isCurrentMonth = monthDate.getFullYear() === calendarBaseDate.getFullYear() && monthDate.getMonth() === calendarBaseDate.getMonth();
  return (
    <>
      <div className="calendar-week-labels">
        {["日", "一", "二", "三", "四", "五", "六"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="month-grid">
        {Array.from({ length: leadingBlankDays }).map((_, index) => (
          <span className="empty-day" key={`empty-${index}`} />
        ))}
        {days.map((day) => {
          const dayDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
          const isFuture = dayDate.getTime() > calendarBaseDate.getTime();
          const isPast = dayDate.getTime() < calendarBaseDate.getTime();
          const record = !isFuture && isCurrentMonth ? calendarRecords.get(day) : undefined;
          const isToday = isCurrentMonth && day === 8;
          return (
            <motion.button
              key={day}
              className={`${record ? "has-record" : ""} ${isPast ? "past-day" : ""} ${isFuture ? "future-day" : ""} ${isToday ? "today" : ""}`}
              disabled={isFuture}
              type="button"
              whileTap={{ scale: 0.86 }}
              onClick={() => !isFuture && record && openTask(record.vocab >= 20 ? "vocab" : "speech")}
            >
              <span>{day}</span>
              {record && (
                <i>
                  {record.speech > 0 && <b className="speech-dot" />}
                  {record.vocab > 0 && <b className="vocab-dot" />}
                </i>
              )}
            </motion.button>
          );
        })}
      </div>
    </>
  );
}

function QuarterCalendarView({ openTask }: { openTask: (mode: StudyMode) => void }) {
  return (
    <div className="quarter-list">
      {quarterRecords.map((item) => {
        const speechWidth = item.status === "future" ? 0 : Math.max(10, Math.min(28, item.speech * 0.78));
        const vocabWidth = item.status === "future" ? 0 : Math.max(18, Math.min(38, item.vocab / 28));
        const reviewWidth = item.status === "future" ? 0 : Math.max(7, item.review * 1.1);
        const shareWidth = item.status === "future" ? 0 : Math.max(6, item.share * 0.88);
        return (
          <button
            className={item.status}
            disabled={item.status === "future"}
            key={item.season}
            type="button"
            onClick={() => item.status !== "future" && openTask(item.vocab > 300 ? "vocab" : "speech")}
          >
            <span className="quarter-season">
              <i aria-hidden="true" />
              <strong>{item.season}</strong>
              <small>{item.months}</small>
            </span>
            <span className="quarter-summary">
              <span className="quarter-flow" aria-label={`${item.season} 完成情况`}>
                <i className="speech" style={{ width: `${speechWidth}%` }} />
                <i className="vocab" style={{ left: `${speechWidth}%`, width: `${vocabWidth}%` }} />
                <i className="review" style={{ left: `${speechWidth + vocabWidth}%`, width: `${reviewWidth}%` }} />
                <i className="share" style={{ left: `${speechWidth + vocabWidth + reviewWidth}%`, width: `${shareWidth}%` }} />
              </span>
              <small>{item.speech} 次口语 · {item.vocab} 词 · {item.review} 条评语 · {item.share} 次分享</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function YearCalendarView({ openTask }: { openTask: (mode: StudyMode) => void }) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const visibleYearRecords = useMemo(() => yearRecords.slice(0, calendarBaseDate.getMonth() + 1), []);

  useEffect(() => {
    let disposed = false;
    let chart: EChartsType | null = null;

    async function renderRose() {
      if (!chartRef.current) return;
      const echarts = await import("echarts");
      if (disposed || !chartRef.current) return;

      chart = echarts.init(chartRef.current, null, {
        renderer: "canvas",
        useDirtyRect: true
      });
      const cssVars = getComputedStyle(chartRef.current);
      const textColor = cssVars.getPropertyValue("--mini-text").trim() || "#111827";
      const mutedColor = cssVars.getPropertyValue("--mini-muted").trim() || "#6b7280";
      const cardColor = cssVars.getPropertyValue("--mini-card").trim() || "#ffffff";

      chart.setOption({
        animationDuration: 820,
        animationEasing: "cubicOut",
        tooltip: {
          trigger: "item",
          borderWidth: 0,
          padding: [8, 10],
          formatter: (params: { data?: { name?: string; value?: number; activeDays?: number } }) => {
            const data = params.data;
            return `${data?.name ?? ""}<br/>完成率 ${data?.value ?? 0}%<br/>学习 ${data?.activeDays ?? 0} 天`;
          }
        },
        series: [
          {
            name: "年度学习",
            type: "pie",
            radius: ["8%", "82%"],
            center: ["50%", "50%"],
            roseType: "area",
            startAngle: 105,
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 8,
              borderColor: cardColor,
              borderWidth: 2,
              shadowBlur: 14,
              shadowColor: "rgba(73, 66, 228, 0.18)"
            },
            label: {
              show: true,
              position: "outside",
              color: textColor,
              fontSize: 10,
              fontWeight: 800,
              formatter: (params: { data?: { name?: string; value?: number; activeDays?: number } }) => {
                const data = params.data;
                return `{month|${data?.name ?? ""}}\n{metric|${data?.value ?? 0}% · ${data?.activeDays ?? 0}天}`;
              },
              rich: {
                month: {
                  fontSize: 10,
                  fontWeight: 900,
                  color: textColor,
                  lineHeight: 14
                },
                metric: {
                  fontSize: 9,
                  fontWeight: 800,
                  color: mutedColor,
                  lineHeight: 12
                }
              }
            },
            labelLine: {
              show: true,
              length: 4,
              length2: 4,
              lineStyle: {
                color: mutedColor,
                opacity: 0.34,
                width: 1
              }
            },
            data: visibleYearRecords.map((item, index) => ({
              value: item.rate,
              name: item.month,
              activeDays: Math.max(1, Math.round(item.rate * 0.38)),
              itemStyle: { color: roseColors[index % roseColors.length] }
            }))
          }
        ]
      });

      chart.on("click", (params: unknown) => {
        const dataIndex = (params as { dataIndex?: unknown }).dataIndex;
        const item = visibleYearRecords[typeof dataIndex === "number" ? dataIndex : -1];
        if (item) {
          openTask(item.rate > 55 ? "vocab" : "speech");
        }
      });
    }

    renderRose();

    const resize = () => chart?.resize();
    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      chart?.dispose();
    };
  }, [openTask, visibleYearRecords]);

  return (
    <div className="year-radial">
      <div className="year-radial-chart year-rose-chart" aria-label="年度 12 个月 Nightingale Rose 学习完成度">
        <div className="year-echarts" ref={chartRef} />
      </div>
    </div>
  );
}

function CirclePage({ filter, setFilter }: { filter: CircleFilter; setFilter: (filter: CircleFilter) => void }) {
  const feedRef = useRef<HTMLDivElement | null>(null);
  const visibleItems = circleItems.filter((item) => filter === "all" || item.type === filter);

  useLayoutEffect(() => {
    let cleanup = () => {};

    async function setupReveal() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const context = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>(".feed-card");

        if (reduceMotion) {
          gsap.set(cards, { autoAlpha: 1, y: 0, scale: 1, clearProps: "transform,opacity,visibility" });
          return;
        }

        gsap.set(cards, { autoAlpha: 0, y: 26, willChange: "transform, opacity" });

        cards.forEach((card) => {
          gsap.to(card, {
            autoAlpha: 1,
            y: 0,
            duration: 0.64,
            ease: "power3.out",
            onComplete: () => {
              card.style.willChange = "auto";
            },
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              once: true
            }
          });
        });
        ScrollTrigger.refresh();
      }, feedRef);

      cleanup = () => context.revert();
    }

    setupReveal();
    return () => cleanup();
  }, [filter]);

  return (
    <section className="circle-page">
      <CircleAdBanner />
      <div className="circle-filter">
        {[
          ["all", "全部"],
          ["note", "笔记文章"],
          ["event", "活动"],
          ["resource", "资料"]
        ].map(([id, label]) => (
          <button key={id} className={filter === id ? "active" : ""} type="button" onClick={() => setFilter(id as CircleFilter)}>
            {label}
          </button>
        ))}
      </div>
      <div className="masonry-feed" ref={feedRef}>
        {visibleItems.map((item, index) => (
          <article
            className={`feed-card ${item.tone} ${item.height}`}
            key={`${item.title}-${index}`}
          >
            <div className="feed-visual">
              <img src={item.image} alt="" aria-hidden="true" />
              <Sparkles size={18} />
            </div>
            <div className="feed-tags">
              <span>{item.tag}</span>
              <b>{item.pay}</b>
            </div>
            <h2>{item.title}</h2>
            <p>{item.type === "event" ? "查看报名与核销信息" : item.pay === "付费" ? "付费后解锁完整内容" : "可直接阅读与收藏"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AIChatPage({ onClose }: { onClose: () => void }) {
  return (
    <motion.section
      className="ai-chat-page"
      initial={{ opacity: 0, scale: 0.98, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 18 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <header className="ai-chat-topbar">
        <button className="ai-chat-close" type="button" aria-label="退出 AI 对话" onClick={onClose}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <span>Ivy AI Coach</span>
          <strong>AI 学习教练</strong>
        </div>
        <Bot size={20} />
      </header>
      <div className="chat-thread">
        <div className="chat-bubble assistant">
          <span>AI</span>
          <p>今天想先复盘口语、背词，还是找一份适合你的资料？</p>
        </div>
        <div className="chat-bubble user">
          <p>帮我安排今天 20 分钟英语练习。</p>
        </div>
        <div className="chat-bubble assistant">
          <span>AI</span>
          <p>建议先做 6 分钟口语跟读，再做 12 个核心词，最后 3 分钟复习昨天错词。</p>
        </div>
      </div>
      <div className="ai-suggestions">
        {["生成今日计划", "推荐资料", "复盘错词"].map((item) => (
          <button key={item} type="button">
            {item}
          </button>
        ))}
      </div>
      <div className="chat-input-bar">
        <input placeholder="问问 Ivy AI..." />
        <button type="button">
          <Sparkles size={17} />
        </button>
      </div>
    </motion.section>
  );
}

function SpeechTask({
  evaluation,
  evaluating,
  runEvaluation,
  onBack
}: {
  evaluation: SpeechEvaluationResult | null;
  evaluating: boolean;
  runEvaluation: () => void;
  onBack: () => void;
}) {
  return (
    <section className="task-screen">
      <TaskHeader title="口语练习" subtitle="中考口语跟读 · A Day at School" onBack={onBack} />
      <div className="speech-player">
        <button className="round-action" type="button" aria-label="播放外教原音">
          <Volume2 size={22} />
        </button>
        <p>{transcript}</p>
      </div>
      <div className="waveform" aria-hidden="true">
        {Array.from({ length: 36 }).map((_, index) => (
          <span key={index} style={{ height: `${18 + ((index * 11) % 46)}px` }} />
        ))}
      </div>
      <button className="record-button wide" type="button" onClick={runEvaluation} disabled={evaluating}>
        <Mic size={18} />
        {evaluating ? "AI 正在评测" : "长按模拟录音"}
      </button>
      {evaluation && (
        <div className="result-sheet result-sheet-refined">
          <div className="result-head">
            <strong>{evaluation.score}</strong>
            <span>{evaluation.feedback}</span>
          </div>
          <div className="radar-grid">
            {Object.entries(evaluation.dimensions).map(([name, value]) => (
              <div key={name}>
                <span>{name}</span>
                <meter min={0} max={100} value={value} />
                <b>{value}</b>
              </div>
            ))}
          </div>
          <p className="token-row">
            {evaluation.tokens.map((token) => (
              <button className={`token ${token.status}`} key={`${token.token}-${token.score}`} type="button">
                {token.token}
              </button>
            ))}
          </p>
          <button className="unlock-callout" type="button">
            <Share2 size={17} />
            分享成绩单，解锁剑桥听力资料库
          </button>
        </div>
      )}
    </section>
  );
}

function TaskHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <header className="task-header">
      <button className="icon-button" type="button" aria-label="返回学习概览" onClick={onBack}>
        <ArrowLeft size={18} />
      </button>
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </header>
  );
}

function PlanPage() {
  return (
    <section className="plan-page">
      <div className="plan-hero">
        <Compass size={24} />
        <span className="tiny-label">Study Abroad</span>
        <h1>留学与升学规划</h1>
        <p>以路线图组织雅思托福、本地政策、录取案例和阶段诊断。</p>
      </div>
      <div className="timeline-list">
        {["水平诊断", "目标院校", "语言冲刺", "材料准备"].map((item, index) => (
          <button key={item} type="button">
            <span>{index + 1}</span>
            <div>
              <strong>{item}</strong>
              <small>{index === 0 ? "3 分钟生成个性化规划" : "查看阶段资料与任务建议"}</small>
            </div>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
    </section>
  );
}

function ContentPage({
  title,
  summary,
  authorized,
  setAuthorized,
  voucherCount,
  setVoucherCount
}: {
  title: string;
  summary: string;
  authorized: boolean;
  setAuthorized: (value: boolean) => void;
  voucherCount: number;
  setVoucherCount: (updater: (value: number) => number) => void;
}) {
  return (
    <section className="content-page">
      <div className="library-hero">
        <FileText size={24} />
        <div>
          <span className="tiny-label">Resource Library</span>
          <h1>干货资料库</h1>
        </div>
      </div>
      <article className={`article-gate refined-gate ${authorized ? "unlocked" : ""}`}>
        <span className="tiny-label">需授权 · 预览 50%</span>
        <h2>{title}</h2>
        <p>{summary}</p>
        <p>包含训练计划、真题拆解、评分标准和 PDF 下载。用户深度阅读时触发手机号授权，后台静默打上地域标签。</p>
        {!authorized && (
          <div className="blur-lock refined-lock">
            <LockKeyhole size={22} />
            <strong>一键授权后解锁全文与 PDF</strong>
            <button type="button" onClick={() => setAuthorized(true)}>
              授权手机号
            </button>
          </div>
        )}
        {authorized && (
          <div className="download-row">
            <ShieldCheck size={18} />
            <span>已解锁完整资料，线索进入台州本地公海池。</span>
          </div>
        )}
      </article>
      <div className="share-card refined-share">
        <Gift size={20} />
        <div>
          <strong>邀请好友阅读，得 100 元代金券</strong>
          <span>专属海报带 UTM，好友授权后自动结算。</span>
        </div>
        <button type="button" onClick={() => setVoucherCount((count) => count + 1)}>
          <Share2 size={16} />
          邀请
        </button>
      </div>
      <div className="asset-strip">
        <BadgeCheck size={18} />
        卡券包：{voucherCount} 张可用代金券
        <QrCode size={18} />
      </div>
    </section>
  );
}

function EventsPage() {
  return (
    <section className="events-page">
      <div className="event-hero">
        <GraduationCap size={26} />
        <span className="tiny-label">Live Events</span>
        <h1>讲座活动</h1>
        <p>以活动票卡和日程为主，强调报名、核销二维码和线下转化。</p>
      </div>
      <div className="event-ticket-large">
        <div>
          <span>5 月 18 日 19:30</span>
          <strong>台州中考英语冲刺讲座</strong>
          <small>报名成功后生成核销码，销售可在桌面端核销。</small>
        </div>
        <button type="button">
          <Ticket size={17} />
          立即报名
        </button>
      </div>
      <div className="speaker-strip">
        <Sparkles size={18} />
        名师拆解听口题型、阅读提速和最后 30 天提分策略。
      </div>
    </section>
  );
}
