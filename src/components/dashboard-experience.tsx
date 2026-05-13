"use client";

import type { SeedData } from "@/lib/domain";
import {
  AudioLines,
  BellRing,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  DatabaseZap,
  FileText,
  Filter,
  MapPin,
  PanelRightOpen,
  Play,
  Plus,
  Route,
  Search,
  Send,
  Sparkles,
  TicketCheck,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

export function DashboardExperience({ seed }: { seed: SeedData }) {
  const [commented, setCommented] = useState(false);
  const [published, setPublished] = useState(false);
  const [workMode, setWorkMode] = useState<"teach" | "content" | "crm">("teach");
  const localLeads = useMemo(() => seed.users.filter((user) => user.role === "VISITOR" && user.location.isLocal), [seed.users]);
  const aiTask = seed.resources.find((resource) => resource.type === "AI_TASK")!;
  const article = seed.resources.find((resource) => resource.type === "ARTICLE")!;
  const behavior = seed.behaviors.find((item) => item.action === "SUBMIT_AI_TASK")!;

  return (
    <main className="desktop-stage redesigned-desktop">
      <aside className="sidebar refined-sidebar">
        <div className="brand-mark">
          <Sparkles size={20} />
          <strong>IvyEd</strong>
        </div>
        <SidebarItem icon={DatabaseZap} label="增长总览" active={workMode === "crm"} onClick={() => setWorkMode("crm")} />
        <SidebarItem icon={ClipboardCheck} label="教务工作台" active={workMode === "teach"} onClick={() => setWorkMode("teach")} />
        <SidebarItem icon={FileText} label="内容 CMS" active={workMode === "content"} onClick={() => setWorkMode("content")} />
        <SidebarItem icon={AudioLines} label="人机批改" active={workMode === "teach"} onClick={() => setWorkMode("teach")} />
        <SidebarItem icon={Users} label="线索公海" active={workMode === "crm"} onClick={() => setWorkMode("crm")} />
        <SidebarItem icon={TicketCheck} label="核销中心" active={workMode === "crm"} onClick={() => setWorkMode("crm")} />
      </aside>

      <section className="dashboard-main refined-main">
        <header className="dashboard-header refined-header">
          <div>
            <span className="tiny-label">Command Center</span>
            <h1>教务交付与增长转化一体工作台</h1>
          </div>
          <div className="command-search">
            <Search size={17} />
            <span>搜索学生、资源、手机号</span>
          </div>
          <div className="header-actions">
            <button className="ghost-button" type="button">
              <BellRing size={17} />
              通知队列
            </button>
            <ThemeToggle />
          </div>
        </header>

        <section className="operation-strip">
          <div>
            <span className="tiny-label">Today</span>
            <strong>128 个学习行为进入事件流</strong>
          </div>
          <div className="mode-switch">
            {[
              ["teach", "教务"],
              ["content", "内容"],
              ["crm", "线索"]
            ].map(([id, label]) => (
              <button key={id} className={workMode === id ? "active" : ""} type="button" onClick={() => setWorkMode(id as typeof workMode)}>
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="metric-grid refined-metrics">
          {[
            ["今日打卡", "128", "学生任务完成"],
            ["AI 初评均分", "91.4", "口语任务池"],
            ["台州本地线索", String(localLeads.length), "优先分配"],
            ["待核销资产", "24", "券与活动码"]
          ].map(([label, value, note]) => (
            <article className="metric-card refined-metric" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </article>
          ))}
        </section>

        <AnimatePresence mode="wait">
          {workMode === "teach" && (
            <WorkspaceMotion key="teach">
              <TeachingWorkspace aiTask={aiTask} behaviorScore={Number(behavior.context.score)} commented={commented} setCommented={setCommented} />
            </WorkspaceMotion>
          )}
          {workMode === "content" && (
            <WorkspaceMotion key="content">
              <ContentWorkspace articleTitle={article.metadata.title} aiTaskTitle={aiTask.metadata.title} published={published} setPublished={setPublished} />
            </WorkspaceMotion>
          )}
          {workMode === "crm" && (
            <WorkspaceMotion key="crm">
              <CrmWorkspace localLeads={localLeads} />
            </WorkspaceMotion>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} type="button" onClick={onClick}>
      <Icon size={18} />
      {label}
    </button>
  );
}

function WorkspaceMotion({ children }: { children: ReactNode }) {
  return (
    <motion.section
      className="desktop-workspace"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

function TeachingWorkspace({
  aiTask,
  behaviorScore,
  commented,
  setCommented
}: {
  aiTask: { id: string; metadata: { title: string } };
  behaviorScore: number;
  commented: boolean;
  setCommented: (value: boolean) => void;
}) {
  return (
    <>
      <FlywheelPanel />
      <article className="ops-panel assign-panel">
        <div className="panel-head">
          <div>
            <span className="tiny-label">B2 Assignment</span>
            <h2>作业一键下发</h2>
          </div>
          <button className="send-button" type="button">
            <Send size={17} />
            下发
          </button>
        </div>
        <div className="assignment-builder">
          <label>
            资源
            <select defaultValue={aiTask.id}>
              <option value={aiTask.id}>{aiTask.metadata.title}</option>
            </select>
          </label>
          <label>
            班级
            <select defaultValue="class_2026_a">
              <option value="class_2026_a">初三冲刺 A 班</option>
              <option value="class_ielts">雅思口语小班</option>
            </select>
          </label>
        </div>
        <div className="mini-checklist">
          <span>
            <CheckCircle2 size={16} />
            微信提醒
          </span>
          <span>
            <CalendarDays size={16} />
            写入日历
          </span>
          <span>
            <PanelRightOpen size={16} />
            家长可见
          </span>
        </div>
      </article>
      <article className="ops-panel queue-panel">
        <div className="panel-head">
          <div>
            <span className="tiny-label">Task Queue</span>
            <h2>今日待批改队列</h2>
          </div>
          <AudioLines size={20} />
        </div>
        {["Mia Chen", "Leo Wang", "Ava Lin"].map((name, index) => (
          <div className="queue-row" key={name}>
            <span>{name.slice(0, 1)}</span>
            <div>
              <strong>{name}</strong>
              <small>{index === 0 ? "AI 建议优先复核" : "已完成初评，等待教师评语"}</small>
            </div>
            <b>{index === 0 ? 93 : 88 - index}</b>
          </div>
        ))}
      </article>
      <ReviewPanel score={behaviorScore} commented={commented} setCommented={setCommented} />
    </>
  );
}

function ContentWorkspace({
  articleTitle,
  aiTaskTitle,
  published,
  setPublished
}: {
  articleTitle: string;
  aiTaskTitle: string;
  published: boolean;
  setPublished: (value: boolean) => void;
}) {
  return (
    <>
      <article className="ops-panel flow-panel content-hero-panel">
        <div>
          <span className="tiny-label">Content Matrix</span>
          <h2>栏目树、权限和分享诱饵统一管理</h2>
          <p>干货资料负责留资，活动负责转化，学习任务负责生产成绩海报。</p>
        </div>
        <button className="send-button" type="button">
          <Plus size={17} />
          新建内容
        </button>
      </article>
      <article className="ops-panel cms-panel">
        <div className="panel-head">
          <div>
            <span className="tiny-label">B1 CMS</span>
            <h2>内容与资源管理</h2>
          </div>
          <button className="icon-button" type="button" title="新建资源" aria-label="新建资源">
            <Plus size={18} />
          </button>
        </div>
        <div className="resource-list">
          <ResourceLine icon={<FileText size={19} />} title={articleTitle} meta="PHONE_AUTH_REQUIRED · 预览 50%" action={published ? "已发布" : "发布"} onClick={() => setPublished(true)} />
          <ResourceLine icon={<BookOpenCheck size={19} />} title={aiTaskTitle} meta="FREE · 可下发到班级" action="配置" />
          <ResourceLine icon={<TicketCheck size={19} />} title="台州中考英语冲刺讲座" meta="EVENT · 需报名核销" action="上架" />
        </div>
      </article>
      <article className="ops-panel permission-panel">
        <div className="panel-head">
          <div>
            <span className="tiny-label">Access Rules</span>
            <h2>资源权限配置器</h2>
          </div>
          <Filter size={19} />
        </div>
        {["无门槛阅读", "手机号授权解锁", "分享后解锁"].map((item, index) => (
          <button className={index === 1 ? "permission-row active" : "permission-row"} key={item} type="button">
            <span>{item}</span>
            <small>{index === 1 ? "正在用于雅思提分攻略" : "可应用到任意资源"}</small>
          </button>
        ))}
      </article>
      <article className="ops-panel poster-panel">
        <span className="tiny-label">Poster Preview</span>
        <h2>UTM 动态海报</h2>
        <div className="poster-preview">
          <Sparkles size={22} />
          <strong>雅思口语 7 分攻略</strong>
          <span>扫码解锁完整 PDF</span>
        </div>
      </article>
    </>
  );
}

function CrmWorkspace({ localLeads }: { localLeads: SeedData["users"] }) {
  return (
    <>
      <FlywheelPanel />
      <article className="ops-panel funnel-panel">
        <div className="panel-head">
          <div>
            <span className="tiny-label">Lead Funnel</span>
            <h2>内容营销漏斗</h2>
          </div>
          <DatabaseZap size={20} />
        </div>
        {[
          ["海报访问", 486],
          ["深度阅读", 192],
          ["授权手机号", 64],
          ["台州本地", 41]
        ].map(([label, value]) => (
          <div className="funnel-row" key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </article>
      <LeadPanel localLeads={localLeads} />
      <article className="ops-panel redeem-panel">
        <div className="panel-head">
          <div>
            <span className="tiny-label">Redeem Desk</span>
            <h2>核销中心</h2>
          </div>
          <TicketCheck size={20} />
        </div>
        <div className="redeem-box">
          <strong>100 元代金券</strong>
          <span>输入手机号或扫码核销，过期资产自动拦截。</span>
          <button type="button">扫码核销</button>
        </div>
      </article>
    </>
  );
}

function FlywheelPanel() {
  return (
    <article className="ops-panel flow-panel">
      <div className="panel-head">
        <div>
          <span className="tiny-label">7-Step Flywheel</span>
          <h2>教学服务闭环到线索回流</h2>
        </div>
        <Route size={20} />
      </div>
      <div className="flywheel-line">
        {["发布", "打卡", "分享", "扫码", "留资", "回流", "成交"].map((item, index) => (
          <button key={item} className={index < 5 ? "done" : ""} type="button">
            <span>{index + 1}</span>
            {item}
          </button>
        ))}
      </div>
    </article>
  );
}

function ReviewPanel({ score, commented, setCommented }: { score: number; commented: boolean; setCommented: (value: boolean) => void }) {
  return (
    <article className="ops-panel review-panel">
      <div className="panel-head">
        <div>
          <span className="tiny-label">B2 AI Co-review</span>
          <h2>人机协作批改</h2>
        </div>
        <button className="ghost-button" type="button">
          <Play size={17} />
          播放录音
        </button>
      </div>
      <div className="review-layout refined-review">
        <div className="ai-score-card">
          <span>AI 初评</span>
          <strong>{score}</strong>
          <div className="radial-bars">
            <i style={{ height: "72%" }} />
            <i style={{ height: "88%" }} />
            <i style={{ height: "66%" }} />
            <i style={{ height: "92%" }} />
          </div>
        </div>
        <textarea defaultValue="Mia 今天流利度很好，school 尾音可以再收得更轻。继续保持每日 5 分钟跟读。" />
        <button className="send-button" type="button" onClick={() => setCommented(true)}>
          <Send size={17} />
          {commented ? "已通知家长" : "提交评语"}
        </button>
      </div>
    </article>
  );
}

function LeadPanel({ localLeads }: { localLeads: SeedData["users"] }) {
  return (
    <article className="ops-panel lead-panel">
      <div className="panel-head">
        <div>
          <span className="tiny-label">B3 CRM Pool</span>
          <h2>授权线索公海池</h2>
        </div>
        <button className="ghost-button" type="button">
          <Filter size={17} />
          台州本地
        </button>
      </div>
      <div className="lead-table refined-table">
        <div className="lead-head">
          <span>手机号</span>
          <span>地域</span>
          <span>来源</span>
          <span>动作</span>
        </div>
        {localLeads.map((lead) => (
          <div className="lead-row" key={lead.id}>
            <strong>138****2026</strong>
            <span className="local-tag">
              <MapPin size={14} />
              {lead.location.cityName}本地
            </span>
            <span>雅思攻略海报</span>
            <button type="button">分配企微</button>
          </div>
        ))}
      </div>
    </article>
  );
}

function ResourceLine({
  icon,
  title,
  meta,
  action,
  onClick
}: {
  icon: ReactNode;
  title: string;
  meta: string;
  action: string;
  onClick?: () => void;
}) {
  return (
    <div className="resource-line">
      <div className="resource-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{meta}</span>
      </div>
      <button type="button" onClick={onClick}>
        {action}
      </button>
    </div>
  );
}
