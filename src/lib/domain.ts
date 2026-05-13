export type UserRole = "STUDENT" | "PARENT" | "VISITOR";
export type PhoneAuthStatus = "AUTHORIZED" | "UNAUTHORIZED";
export type ResourceType = "ARTICLE" | "AI_TASK" | "EVENT";
export type ResourceStatus = "DRAFT" | "PUBLISHED";
export type UnlockCondition = "FREE" | "PHONE_AUTH_REQUIRED" | "SHARE_REQUIRED";
export type AssetType = "VOUCHER" | "PRIVILEGE";
export type AssetStatus = "ACTIVE" | "USED" | "EXPIRED";
export type BehaviorType =
  | "SUBMIT_AI_TASK"
  | "PHONE_AUTH"
  | "SHARE_RESOURCE"
  | "READ_RESOURCE"
  | "REDEEM_ASSET";
export type RuleStatus = "ENABLED" | "DISABLED";

export interface UserProfile {
  nickname: string;
  avatar: string;
}

export interface IPLocation {
  cityCode: string;
  cityName: string;
  isLocal: boolean;
}

export interface UserRelation {
  id: string;
  sharerId: string;
  originResource: string;
  createdAt: string;
}

export interface User {
  id: string;
  profile: UserProfile;
  role: UserRole;
  location: IPLocation;
  authStatus: PhoneAuthStatus;
  relation?: UserRelation;
}

export interface AccessRule {
  id: string;
  condition: UnlockCondition;
  previewLimit: number;
}

export interface ResourceMetadata {
  title: string;
  cover: string;
  tag: string;
  summary: string;
  estimatedMinutes: number;
}

export interface Resource {
  id: string;
  type: ResourceType;
  metadata: ResourceMetadata;
  status: ResourceStatus;
  accessRule: AccessRule;
}

export interface Asset {
  id: string;
  ownerId: string;
  type: AssetType;
  value: string;
  source: string;
  status: AssetStatus;
  expireAt: string;
}

export interface BehaviorLog {
  id: string;
  actorId: string;
  action: BehaviorType;
  target: string;
  context: Record<string, string | number | boolean>;
  occurredAt: string;
}

export interface Rule {
  id: string;
  status: RuleStatus;
  listenTo: BehaviorType;
  conditionTree: string;
  actions: string[];
}

export interface SeedData {
  users: User[];
  resources: Resource[];
  assets: Asset[];
  behaviors: BehaviorLog[];
  rules: Rule[];
}
