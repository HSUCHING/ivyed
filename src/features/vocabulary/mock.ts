import type { LearningScenario, MaterialSource, StudyPlan, UserWordState, VocabularyProfile, Word, WordBook, WrongWordRecord } from "./types";

const now = "2026-05-10T08:00:00.000Z";

export const mockScenarios: LearningScenario[] = [
  {
    id: "scenario_exam_core",
    name: "考试备考场景",
    type: "exam",
    description: "围绕中高频考试词、识别速度、拼写准确率和语境判断组织任务。",
    targetGoals: ["cet4", "cet6", "postgraduate", "ielts", "toefl"],
    recommendedSourceTypes: ["exam_book", "official_book", "ai_generated"],
    tags: ["考试", "高频", "拼写"]
  },
  {
    id: "scenario_daily_speaking",
    name: "日常口语场景",
    type: "daily",
    description: "把词汇绑定到日常表达、口语例句和可复述场景里。",
    targetGoals: ["daily", "course"],
    recommendedSourceTypes: ["course_words", "content_words", "ai_generated"],
    tags: ["口语", "例句", "复述"]
  },
  {
    id: "scenario_reading_boost",
    name: "阅读提升场景",
    type: "reading",
    description: "优先学习文章、课程和笔记中反复出现的阅读生词。",
    targetGoals: ["reading", "course", "ielts", "toefl"],
    recommendedSourceTypes: ["content_words", "note_words", "official_book"],
    tags: ["阅读", "语境", "长难句"]
  },
  {
    id: "scenario_business",
    name: "商务沟通场景",
    type: "business",
    description: "偏向会议、邮件、项目沟通和商务表达中的高频词。",
    targetGoals: ["business"],
    recommendedSourceTypes: ["official_book", "custom_book", "ai_generated"],
    tags: ["商务", "邮件", "表达"]
  }
];

export const mockMaterialSources: MaterialSource[] = [
  {
    id: "source_exam_book",
    type: "exam_book",
    name: "考试核心词库",
    description: "覆盖考试高频词、同义替换和写作常用表达。",
    createdBy: "system",
    createdAt: now
  },
  {
    id: "source_course_words",
    type: "course_words",
    name: "主程序课程生词",
    description: "来自课程学习和阅读材料中的生词集合。",
    sourceRefId: "course_middle_school_core",
    createdBy: "system",
    createdAt: now
  },
  {
    id: "source_ai_generated",
    type: "ai_generated",
    name: "AI 目标词库",
    description: "根据学习目标、场景和薄弱项生成的轻量词表。",
    createdBy: "ai",
    createdAt: now
  }
];

export const mockWords: Word[] = [
  {
    id: "word_achieve",
    itemType: "word",
    type: "word",
    title: "achieve",
    text: "achieve",
    word: "achieve",
    phonetic: "/əˈtʃiːv/",
    audioUrl: "",
    meaningCn: "实现，达到",
    meaningEn: "to succeed in doing something after trying hard",
    example: "She worked hard to achieve her goal.",
    exampleTranslation: "她努力工作来实现自己的目标。",
    scenarioTags: ["考试备考", "目标表达"],
    sourceId: "source_exam_book",
    difficulty: "easy",
    tags: ["中考", "核心动词"],
    metadata: {
      root: "achiev-",
      synonyms: ["reach", "accomplish"],
      antonyms: ["fail"],
      collocations: ["achieve a goal", "achieve success"],
      aiMemoryHint: "把 achieve 和 a-cheer 关联：达到目标后为自己欢呼。"
    }
  },
  {
    id: "word_fluency",
    itemType: "word",
    type: "word",
    title: "fluency",
    text: "fluency",
    word: "fluency",
    phonetic: "/ˈfluːənsi/",
    audioUrl: "",
    meaningCn: "流利度",
    meaningEn: "the ability to speak or write a language easily",
    example: "Daily reading can improve your fluency.",
    exampleTranslation: "每日阅读可以提升你的流利度。",
    scenarioTags: ["日常口语", "口语评测"],
    sourceId: "source_course_words",
    difficulty: "medium",
    tags: ["口语", "雅思"],
    metadata: {
      synonyms: ["smoothness"],
      collocations: ["speaking fluency", "reading fluency"],
      aiMemoryHint: "fluent 像 flow，语言像水一样流动就是 fluency。"
    }
  },
  {
    id: "word_policy",
    itemType: "word",
    type: "word",
    title: "policy",
    text: "policy",
    word: "policy",
    phonetic: "/ˈpɒləsi/",
    audioUrl: "",
    meaningCn: "政策",
    meaningEn: "a plan of action agreed by an organization or government",
    example: "The new school policy helps students read more.",
    exampleTranslation: "新的学校政策帮助学生增加阅读。",
    scenarioTags: ["新闻阅读", "升学阅读"],
    sourceId: "source_exam_book",
    difficulty: "medium",
    tags: ["升学", "阅读"],
    metadata: {
      collocations: ["school policy", "public policy"],
      aiMemoryHint: "policy 常和 school/public/company 搭配，读文章时先判断是谁制定的规则。"
    }
  },
  {
    id: "word_efficient",
    itemType: "word",
    type: "word",
    title: "efficient",
    text: "efficient",
    word: "efficient",
    phonetic: "/ɪˈfɪʃnt/",
    audioUrl: "",
    meaningCn: "高效的",
    meaningEn: "working well without wasting time or energy",
    example: "This is an efficient way to review vocabulary.",
    exampleTranslation: "这是一种高效复习词汇的方法。",
    scenarioTags: ["学习策略", "写作表达"],
    sourceId: "source_ai_generated",
    difficulty: "medium",
    tags: ["学习策略", "写作"],
    metadata: {
      synonyms: ["effective", "productive"],
      antonyms: ["inefficient"],
      collocations: ["efficient method", "efficient system"],
      aiMemoryHint: "efficient 强调不浪费时间和精力，和 effective 的“有效”略有区别。"
    }
  },
  {
    id: "word_evidence",
    itemType: "word",
    type: "word",
    title: "evidence",
    text: "evidence",
    word: "evidence",
    phonetic: "/ˈevɪdəns/",
    audioUrl: "",
    meaningCn: "证据，依据",
    meaningEn: "facts or signs that show something is true",
    example: "The report gives clear evidence of progress.",
    exampleTranslation: "报告给出了进步的清晰依据。",
    scenarioTags: ["学术阅读", "写作论证"],
    sourceId: "source_exam_book",
    difficulty: "hard",
    tags: ["写作", "阅读"],
    metadata: {
      collocations: ["clear evidence", "strong evidence"],
      aiMemoryHint: "写作中 evidence 是支撑观点的证据，常跟 show/suggest/give 搭配。"
    }
  },
  {
    id: "word_strategy",
    itemType: "word",
    type: "word",
    title: "strategy",
    text: "strategy",
    word: "strategy",
    phonetic: "/ˈstrætədʒi/",
    audioUrl: "",
    meaningCn: "策略",
    meaningEn: "a plan used to achieve a goal",
    example: "A good strategy makes learning easier.",
    exampleTranslation: "好的策略会让学习更轻松。",
    scenarioTags: ["学习规划", "商务沟通"],
    sourceId: "source_ai_generated",
    difficulty: "medium",
    tags: ["学习规划", "核心名词"],
    metadata: {
      collocations: ["learning strategy", "business strategy"],
      aiMemoryHint: "strategy 是为了达成目标而制定的一套方法，不是单个技巧。"
    }
  },
  {
    id: "word_accuracy",
    itemType: "word",
    type: "word",
    title: "accuracy",
    text: "accuracy",
    word: "accuracy",
    phonetic: "/ˈækjərəsi/",
    audioUrl: "",
    meaningCn: "准确性",
    meaningEn: "the quality of being correct or exact",
    example: "Pronunciation accuracy matters in speaking tests.",
    exampleTranslation: "发音准确性在口语考试中很重要。",
    scenarioTags: ["口语评测", "考试备考"],
    sourceId: "source_course_words",
    difficulty: "medium",
    tags: ["口语", "评测"],
    metadata: {
      collocations: ["pronunciation accuracy", "high accuracy"],
      aiMemoryHint: "accuracy 关注正确和精准，口语里常指发音准确。"
    }
  },
  {
    id: "word_consistent",
    itemType: "word",
    type: "word",
    title: "consistent",
    text: "consistent",
    word: "consistent",
    phonetic: "/kənˈsɪstənt/",
    audioUrl: "",
    meaningCn: "持续一致的",
    meaningEn: "continuing to happen in the same way",
    example: "Consistent practice creates visible progress.",
    exampleTranslation: "持续一致的练习会带来可见的进步。",
    scenarioTags: ["成长反馈", "写作表达"],
    sourceId: "source_ai_generated",
    difficulty: "hard",
    tags: ["成长", "写作"],
    metadata: {
      collocations: ["consistent practice", "consistent progress"],
      aiMemoryHint: "consistent 不只是持续，还强调前后稳定一致。"
    }
  }
];

export const mockWordBooks: WordBook[] = [
  {
    id: "book_exam_core_1200",
    name: "考试核心词 1200",
    description: "适合考试备考的高频词库，包含识别、反向回忆和拼写训练。",
    category: "exam",
    scenarioId: "scenario_exam_core",
    sourceId: "source_exam_book",
    totalItems: mockWords.length,
    itemIds: mockWords.map((word) => word.id),
    difficulty: "medium",
    createdBy: "system",
    createdAt: now
  },
  {
    id: "book_course_words",
    name: "课程生词本",
    description: "来自主程序课程和文章的生词，适合课程学习后快速复盘。",
    category: "content",
    scenarioId: "scenario_reading_boost",
    sourceId: "source_course_words",
    totalItems: 4,
    itemIds: ["word_fluency", "word_accuracy", "word_policy", "word_evidence"],
    difficulty: "medium",
    createdBy: "system",
    createdAt: now
  }
];

export const mockVocabularyProfile: VocabularyProfile = {
  userId: "usr_student_001",
  goal: "ielts",
  level: "intermediate",
  dailyNewWords: 6,
  dailyReviewLimit: 8,
  preferences: ["spelling", "example", "exam"],
  currentScenarioId: "scenario_exam_core",
  currentBookId: "book_exam_core_1200",
  currentPlanId: "plan_ielts_exam_core",
  initialized: false,
  createdAt: "2026-05-01T08:00:00.000Z",
  updatedAt: now
};

export const mockStudyPlan: StudyPlan = {
  id: "plan_ielts_exam_core",
  userId: "usr_student_001",
  goal: "ielts",
  scenarioId: "scenario_exam_core",
  bookId: "book_exam_core_1200",
  dailyNewItems: 6,
  dailyReviewLimit: 8,
  testCycle: "weekly",
  estimatedFinishDate: "2026-07-08",
  status: "active",
  version: 1,
  createdAt: "2026-05-01T08:00:00.000Z",
  updatedAt: now
};

export const mockUserWordStates: UserWordState[] = [
  createState("word_fluency", "reviewing", 62, 1, 1, ["meaning_confusion"], "2026-05-10T08:00:00.000Z"),
  createState("word_policy", "wrong", 36, 0, 2, ["unknown", "reverse_recall_failed"], "2026-05-10T08:00:00.000Z"),
  createState("word_efficient", "weak", 48, 1, 1, ["spelling_error"], "2026-05-10T08:00:00.000Z"),
  createState("word_evidence", "familiar", 74, 2, 0, [], "2026-05-11T08:00:00.000Z")
];

export const mockWrongWords: WrongWordRecord[] = [
  createWrong("wrong_policy", "word_policy", 2, ["unknown", "reverse_recall_failed"], 36),
  createWrong("wrong_efficient", "word_efficient", 1, ["spelling_error"], 48)
];

function createState(itemId: string, status: UserWordState["status"], masteryScore: number, correctCount: number, wrongCount: number, errorTypes: UserWordState["errorTypes"], nextReviewAt: string): UserWordState {
  return {
    userId: "usr_student_001",
    itemId,
    wordId: itemId,
    bookId: "book_exam_core_1200",
    status,
    masteryScore,
    correctCount,
    wrongCount,
    continuousCorrectCount: correctCount,
    continuousWrongCount: wrongCount,
    lastStudiedAt: "2026-05-09T09:00:00.000Z",
    nextReviewAt,
    currentIntervalDays: correctCount >= 2 ? 3 : 1,
    easeFactor: 2.3,
    errorTypes,
    updatedAt: now
  };
}

function createWrong(id: string, itemId: string, wrongCount: number, errorTypes: WrongWordRecord["errorTypes"], masteryScore: number): WrongWordRecord {
  return {
    id,
    userId: "usr_student_001",
    itemId,
    wordId: itemId,
    wrongCount,
    errorTypes,
    lastWrongAt: "2026-05-09T19:20:00.000Z",
    masteryScore,
    nextReviewAt: "2026-05-10T08:00:00.000Z",
    resolved: false
  };
}
