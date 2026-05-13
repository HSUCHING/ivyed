import type { SeedData } from "@/lib/domain";

export const seedData: SeedData = {
  users: [
    {
      id: "usr_student_001",
      profile: { nickname: "Mia Chen", avatar: "MC" },
      role: "STUDENT",
      location: { cityCode: "331000", cityName: "台州", isLocal: true },
      authStatus: "AUTHORIZED"
    },
    {
      id: "usr_parent_001",
      profile: { nickname: "Mia 家长", avatar: "家" },
      role: "PARENT",
      location: { cityCode: "331000", cityName: "台州", isLocal: true },
      authStatus: "AUTHORIZED"
    },
    {
      id: "usr_visitor_001",
      profile: { nickname: "外部访客", avatar: "访" },
      role: "VISITOR",
      location: { cityCode: "331000", cityName: "台州", isLocal: true },
      authStatus: "UNAUTHORIZED",
      relation: {
        id: "rel_001",
        sharerId: "usr_parent_001",
        originResource: "res_article_ielts_001",
        createdAt: "2026-05-07T08:20:00.000Z"
      }
    }
  ],
  resources: [
    {
      id: "res_task_speech_001",
      type: "AI_TASK",
      metadata: {
        title: "中考口语跟读：A Day at School",
        cover: "speech-gradient",
        tag: "口语打卡",
        summary: "朗读短文并获得音素级红黄绿纠错与综合评分。",
        estimatedMinutes: 4
      },
      status: "PUBLISHED",
      accessRule: { id: "rule_access_speech", condition: "FREE", previewLimit: 1 }
    },
    {
      id: "res_article_ielts_001",
      type: "ARTICLE",
      metadata: {
        title: "雅思口语 7 分提分攻略",
        cover: "ielts-prism",
        tag: "留学与升学",
        summary: "围绕口语流利度、词汇多样性、发音与任务完成度拆解训练路径。",
        estimatedMinutes: 8
      },
      status: "PUBLISHED",
      accessRule: { id: "rule_access_phone", condition: "PHONE_AUTH_REQUIRED", previewLimit: 0.5 }
    },
    {
      id: "res_event_lecture_001",
      type: "EVENT",
      metadata: {
        title: "台州中考英语冲刺讲座",
        cover: "event-neon",
        tag: "讲座活动",
        summary: "线下名师讲座，报名后生成核销二维码。",
        estimatedMinutes: 2
      },
      status: "PUBLISHED",
      accessRule: { id: "rule_access_event", condition: "PHONE_AUTH_REQUIRED", previewLimit: 0.8 }
    }
  ],
  assets: [
    {
      id: "ast_voucher_001",
      ownerId: "usr_parent_001",
      type: "VOUCHER",
      value: "100元代金券",
      source: "UserPhoneAuthorized via res_article_ielts_001",
      status: "ACTIVE",
      expireAt: "2026-06-06T23:59:59.000Z"
    },
    {
      id: "ast_privilege_001",
      ownerId: "usr_student_001",
      type: "PRIVILEGE",
      value: "剑桥听力资料库",
      source: "ResourceShared after AI score >= 90",
      status: "ACTIVE",
      expireAt: "2026-12-31T23:59:59.000Z"
    }
  ],
  behaviors: [
    {
      id: "beh_001",
      actorId: "usr_student_001",
      action: "SUBMIT_AI_TASK",
      target: "res_task_speech_001",
      context: { score: 93, fluency: 91, accuracy: 94, emotion: 88 },
      occurredAt: "2026-05-07T10:00:00.000Z"
    },
    {
      id: "beh_002",
      actorId: "usr_parent_001",
      action: "SHARE_RESOURCE",
      target: "res_article_ielts_001",
      context: { utm: "utm_parent_001_ielts", channel: "moments" },
      occurredAt: "2026-05-07T10:05:00.000Z"
    },
    {
      id: "beh_003",
      actorId: "usr_visitor_001",
      action: "PHONE_AUTH",
      target: "res_article_ielts_001",
      context: { phoneMasked: "138****2026", isFirstDevice: true, city: "台州" },
      occurredAt: "2026-05-07T10:07:00.000Z"
    }
  ],
  rules: [
    {
      id: "rul_lead_capture",
      status: "ENABLED",
      listenTo: "READ_RESOURCE",
      conditionTree: "Resource.AccessRule == PHONE_AUTH_REQUIRED AND User.authStatus == UNAUTHORIZED",
      actions: ["Throw RequiresAuthorizationException"]
    },
    {
      id: "rul_referral_voucher",
      status: "ENABLED",
      listenTo: "PHONE_AUTH",
      conditionTree: "UserRelation.sharerId exists AND dailyRewardLimit not reached AND isFirstDevice == true",
      actions: ["GrantAsset(VOUCHER, 100元代金券, sharerId)"]
    },
    {
      id: "rul_score_privilege",
      status: "ENABLED",
      listenTo: "SHARE_RESOURCE",
      conditionTree: "Previous AITaskSubmitted.score >= 90",
      actions: ["GrantAsset(PRIVILEGE, 剑桥听力资料库, actorId)"]
    }
  ]
};
