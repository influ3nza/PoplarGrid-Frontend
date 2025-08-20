export interface User {
  id: number
  role: number
  team: {
    description: string
    id: number
    moetran_id: string
    name: string
  }
  
}

export interface MemberLabor {
  joinedTime: string // 加入时间
  laborRole: number // 成员在项目中的角色，使用掩码
  nickname: string // 昵称
  user_id: number // 用户ID
}

// 项目基本信息
export interface ProjectBasic {
  allowAutoJoin: boolean // 是否允许自动加入
  id: number // 项目id，主键
  isHidden: boolean // 是否隐藏
  isPublished: boolean // 是否已发布
  labors: MemberLabor[] // 成员分工信息
  legacyId: number // 旧系统中的项目id
  moetranId: string // 龙译项目id
  status: number // 项目状态，使用掩码
  title: string // 项目标题
  worksetId: number // 所属工作集id
  worksetIndex: number // 项目处于工作集中的编号
}

// 项目详细信息
export interface ProjectDetail extends ProjectBasic {
  createdAt: string // 创建时间
  description: string // 项目描述
  updatedAt: string // 更新时间
}

// 项目文件信息
export interface ProjectFile {
  id: string // 文件id
  name: string // 文件名
  coverUrl: string // 封面缩略图url
  fullUrl: string // 完整图url
  sourceCount: number // 总标记数量
  translatedSourceCount: number // 已翻译标记数量
  checkedSourceCount: number // 已校对标记数量
}

export interface ProjectProgress {
  translation: number // 0-100
  proofreading: number // 0-100
  typesetting: 'not_started' | 'in_progress' | 'completed'
  review: 'not_reviewed' | 'reviewing' | 'reviewed'
  totalSources: number
  completedSources: number
}

export interface Source {
  id: string
  content: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  translations: Translation[]
}

export interface Translation {
  id: string
  content: string
  language: string
  translator: User
  proofreader?: User
  status: 'draft' | 'translated' | 'proofread'
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: string
  name: string
  description?: string
  avatar?: string
  members: TeamMember[]
  projects: Project[]
  projectSets: ProjectSet[]
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  userId: string
  user: User
  teamId: string
  role: 'admin' | 'member'
  joinedAt: string
  status: 'active' | 'pending' | 'left'
}

// 新增项目集接口
export interface ProjectSet {
  id: string
  name: string
  description?: string
  teamId: string
  projects: Project[]
  createdAt: string
  updatedAt: string
}

// 项目成员接口
export interface ProjectMember {
  id: string
  userId: string
  user: User
  projectId: string
  roles: ProjectRole[]
  joinedAt: string
  invitedBy?: string // 邀请人ID
  status: 'active' | 'pending' | 'rejected' // 成员状态
}

// 项目角色枚举 - 添加图源和美工角色
export type ProjectRole = 'image_source' | 'artist' | 'translator' | 'proofreader' | 'typesetter' | 'reviewer'

// 项目申请接口
export interface ProjectApplication {
  id: string
  projectId: string
  userId: string
  user: User
  requestedRoles: ProjectRole[]
  message?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
}

// 项目邀请接口
export interface ProjectInvitation {
  id: string
  projectId: string
  inviterId: string
  inviterName?: string // 添加邀请人姓名字段
  invitedUserId: string
  invitedUser: User
  assignedRoles: ProjectRole[]
  message?: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  respondedAt?: string
}

// 角色权限定义
export interface RolePermissions {
  canTranslate: boolean
  canProofread: boolean
  canViewTranslations: boolean
  canSetTypesettingStatus: boolean
  canSetReviewStatus: boolean
  canExportFiles: boolean
  canManageMembers: boolean
  canEditProject: boolean
}

export interface ApiConfig {
  baseUrl: string
  apiKey?: string
}

export interface LoginRequest {
  name: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  teams: Team[] // 用户所属的团队列表
}

export interface Statistics {
  projects: {
    total: number
    active: number
    completed: number
  }
  users: {
    total: number
    active: number
  }
  translations: {
    total: number
    completed: number
    inProgress: number
  }
}

// 更新时间统计接口
export interface TimeBasedStatistics {
  yesterday: {
    completed: number
    comparison: number // 与前天的对比
  }
  lastWeek: {
    completed: number
    comparison: number // 与上上周的对比
  }
  lastMonth: {
    completed: number
    comparison: number // 与上上个月的对比
  }
  trends: {
    daily: Array<{
      date: string
      completed: number
    }>
    weekly: Array<{
      week: string
      completed: number
    }>
    monthly: Array<{
      month: string
      completed: number
    }>
  }
}

// 团队统计接口
export interface TeamStatistics {
  teamId: string
  teamName: string
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalMembers: number
  completionRate: number
  recentActivity: {
    date: string
    completed: number
  }[]
}

// 新增：项目同步相关接口
export interface SyncedProject {
  id: string
  serialNumber: number // 项目序号
  name: string
  originalName: string // 原始项目名（包含序号格式）
  type?: string // 项目类型标签
  imageSource?: string // 图源
  artist?: string // 美工
  translator?: string // 翻译
  proofreader?: string // 校对
  typesetter?: string // 嵌字
  reviewer?: string // 审核
  publishStatus: number // 发布状态
  workStatus: number,
  lastUpdated: string // 上次更新日期
  notes?: string // 备注
  coverImage: string
  members: SyncedProjectMember[] // 项目成员
  externalProjectId?: string // 外部平台项目ID
  createdAt: string
  updatedAt: string
}

export interface SyncedProjectMember {
  userId: string
  userName: string
  role: 'image_source' | 'artist' | 'translator' | 'proofreader' | 'typesetter' | 'reviewer'
  assignedAt: string
}

export interface ProjectTag {
  id: string
  name: string
  color: string
  description?: string
  createdAt: string
}

export interface SyncResult {
  success: boolean
  syncedCount: number
  newCount: number
  updatedCount: number
  errors: string[]
  lastSyncTime: string
}