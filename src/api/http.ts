import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useConfigStore } from "@/stores/config";
import { ElMessage } from "element-plus";
import { isHidden } from "element-plus/es/components/focus-trap/index.mjs";

const createHttpClient = () => {
  const client = axios.create({
    timeout: 10000,
  });

  client.interceptors.request.use(
    (config) => {
      const authStore = useAuthStore();
      const configStore = useConfigStore();

      // Set base URL from config
      if (!config.baseURL) {
        config.baseURL = configStore.apiConfig.baseUrl;
      }

      // Add auth token
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      return response.data;
    },
    (error) => {
      const authStore = useAuthStore();

      if (error.response?.status === 401) {
        authStore.logout();
        ElMessage.error("登录已过期，请重新登录");
        window.location.href = "/login";
      } else if (error.response?.status >= 500) {
        ElMessage.error("服务器错误，请稍后重试");
      } else if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message);
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const http = createHttpClient();

// 生成模拟的时间统计数据
const generateTimeBasedMockData = () => {
  const now = new Date();

  // 生成每日趋势数据（最近30天）
  const dailyTrends = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dailyTrends.push({
      date: date.toISOString().split("T")[0],
      completed: Math.floor(Math.random() * 5) + 1,
    });
  }

  // 生成每周趋势数据（最近12周）
  const weeklyTrends = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    weeklyTrends.push({
      week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}-${
        weekEnd.getMonth() + 1
      }/${weekEnd.getDate()}`,
      completed: Math.floor(Math.random() * 15) + 5,
    });
  }

  // 生成每月趋势数据（最近12个月）
  const monthlyTrends = [];
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyTrends.push({
      month: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
      completed: Math.floor(Math.random() * 50) + 20,
    });
  }

  // 计算对比数据
  const yesterdayCompleted = Math.floor(Math.random() * 3) + 1;
  const dayBeforeYesterday = Math.floor(Math.random() * 3) + 1;
  const yesterdayComparison =
    dayBeforeYesterday > 0
      ? ((yesterdayCompleted - dayBeforeYesterday) / dayBeforeYesterday) * 100
      : 0;

  const lastWeekCompleted = Math.floor(Math.random() * 10) + 5;
  const weekBeforeLast = Math.floor(Math.random() * 10) + 5;
  const lastWeekComparison =
    weekBeforeLast > 0
      ? ((lastWeekCompleted - weekBeforeLast) / weekBeforeLast) * 100
      : 0;

  const lastMonthCompleted = Math.floor(Math.random() * 30) + 15;
  const monthBeforeLast = Math.floor(Math.random() * 30) + 15;
  const lastMonthComparison =
    monthBeforeLast > 0
      ? ((lastMonthCompleted - monthBeforeLast) / monthBeforeLast) * 100
      : 0;

  return {
    yesterday: {
      completed: yesterdayCompleted,
      comparison: yesterdayComparison,
    },
    lastWeek: {
      completed: lastWeekCompleted,
      comparison: lastWeekComparison,
    },
    lastMonth: {
      completed: lastMonthCompleted,
      comparison: lastMonthComparison,
    },
    trends: {
      daily: dailyTrends,
      weekly: weeklyTrends,
      monthly: monthlyTrends,
    },
  };
};

// 生成模拟的同步项目数据
const generateSyncedProjectsMockData = () => {
  const roles = [
    "image_source",
    "artist",
    "translator",
    "proofreader",
    "typesetter",
    "reviewer",
  ];
  const publishStatuses = [0, 1];
  const workStatuses = [75, 27, 78, 0, 63];
  const projectTypes = ["C105", "C104", "例大祭", "一般向", "成人向"];

  const projects = [];
  for (let i = 1; i <= 15; i++) {
    const serialNumber = i;
    const projectName = `TITLE${i}`;
    const originalName = `【${serialNumber}】${projectName}`;

    // 随机生成成员
    const members = [];
    const memberCount = Math.floor(Math.random() * 4) + 2;
    for (let j = 0; j < memberCount; j++) {
      members.push({
        userId: `user_${i}_${j}`,
        userName: `用户${i}_${j}`,
        role: roles[Math.floor(Math.random() * roles.length)],
        assignedAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    // 根据成员角色分配到对应字段，支持多人
    const getAssignedUsers = (role) => {
      const roleMembers = members.filter((m) => m.role === role);
      return roleMembers.length > 0
        ? roleMembers.map((m) => m.userName).join(", ")
        : undefined;
    };

    projects.push({
      id: `synced_project_${i}`,
      serialNumber,
      name: projectName,
      originalName,
      type:
        Math.random() > 0.3
          ? projectTypes[Math.floor(Math.random() * projectTypes.length)]
          : undefined,
      imageSource: getAssignedUsers("image_source"),
      artist: getAssignedUsers("artist"),
      translator: getAssignedUsers("translator"),
      proofreader: getAssignedUsers("proofreader"),
      typesetter: getAssignedUsers("typesetter"),
      reviewer: getAssignedUsers("reviewer"),
      publishStatus:
        publishStatuses[Math.floor(Math.random() * publishStatuses.length)],
      workStatus: workStatuses[Math.floor(Math.random() * workStatuses.length)],
      lastUpdated: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      notes: Math.random() > 0.7 ? `项目${i}的备注信息` : undefined,
      members,
      externalProjectId: `ext_${i}`,
      coverImage:
        "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=400",
      createdAt: new Date(
        Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updatedAt: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  }

  return projects;
};

// 生成模拟用户数据
const generateMockUsers = () => {
  const users = [
    {
      id: "1",
      name: "admin",
      email: "admin@example.com",
      isAdmin: true,
      avatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
    {
      id: "2",
      name: "user",
      email: "user@example.com",
      isAdmin: false,
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
    },
  ];

  // 生成更多模拟用户
  for (let i = 3; i <= 20; i++) {
    users.push({
      id: i.toString(),
      name: `用户${i}`,
      email: `user${i}@example.com`,
      isAdmin: false,
      avatar: `https://images.pexels.com/photos/${220453 + i}/pexels-photo-${
        220453 + i
      }.jpeg?auto=compress&cs=tinysrgb&w=100`,
    });
  }

  return users;
};

// 生成模拟团队数据
const generateMockTeams = () => {
  return [
    {
      id: "team1",
      name: "翻译组A",
      description: "专注于日漫翻译的团队",
      avatar:
        "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=100",
      members: [
        {
          id: "tm_1",
          userId: "1",
          user: {
            id: "1",
            name: "admin",
            email: "admin@example.com",
            isAdmin: true,
          },
          teamId: "team1",
          role: "admin",
          joinedAt: "2024-01-01T00:00:00Z",
          status: "active",
        },
        {
          id: "tm_2",
          userId: "2",
          user: {
            id: "2",
            name: "user",
            email: "user@example.com",
            isAdmin: false,
          },
          teamId: "team1",
          role: "member",
          joinedAt: "2024-01-02T00:00:00Z",
          status: "active",
        },
      ],
      projects: [],
      projectSets: [
        {
          id: "ps1",
          name: "C105项目集",
          description: "Comic Market 105相关项目",
          teamId: "team1",
          projects: [],
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-15T00:00:00Z",
        },
        {
          id: "ps2",
          name: "例大祭项目集",
          description: "例大祭相关项目",
          teamId: "team1",
          projects: [],
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-15T00:00:00Z",
        },
      ],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "team2",
      name: "翻译组B",
      description: "多语言翻译团队",
      avatar:
        "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=100",
      members: [
        {
          id: "tm_3",
          userId: "2",
          user: {
            id: "2",
            name: "user",
            email: "user@example.com",
            isAdmin: false,
          },
          teamId: "team2",
          role: "admin",
          joinedAt: "2024-01-01T00:00:00Z",
          status: "active",
        },
      ],
      projects: [],
      projectSets: [
        {
          id: "ps3",
          name: "韩漫项目集",
          description: "韩国漫画翻译项目",
          teamId: "team2",
          projects: [],
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-15T00:00:00Z",
        },
      ],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
  ];
};

// Mock API responses for development
export const mockApi = {
  login: async (credentials: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (credentials.name === "admin" && credentials.password === "admin") {
      return {
        token: "mock-admin-token",
        user: {
          id: 1,
          isAdmin: true,
          moetranId: "moetran-id-1",
          moetranJwt: "moetran-jwt-1",
          nickname: "capacitor",
          email: "mail1@163.com",
          qqNumber: "1234432112",
          remark: "",
        },
        teams: generateMockTeams(),
      };
    } else if (credentials.name === "user" && credentials.password === "user") {
      return {
        token: "mock-user-token",
        user: {
          id: 2,
          isAdmin: false,
          moetranId: "moetran-id-2",
          moetranJwt: "moetran-jwt-2",
          nickname: "resistor",
          email: "mail2@163.com",
          qqNumber: "1357531353",
          remark: "",
        },
        teams: generateMockTeams(),
      };
    }
    throw new Error("用户名或密码错误");
  },

  getProjects: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [
      {
        allowAutoJoin: true,
        id: 120,
        isHidden: false,
        isPublished: false,
        labors: [
          {
            joinedTime: "MOCKTIME1",
            laborRole: 1,
            nickname: "翻译员1",
            userId: 1,
          },
          {
            joinedTime: "MOCKTIME2",
            laborRole: 2,
            nickname: "校对员1",
            userId: 3,
          },
        ],
        legacyId: 1408,
        moetranId: "68923d44ce66c0e10e05222b",
        status: 63,
        title:
          "[天気輪 (甘露アメ)] そんな愛ならいらない2～アリスなんかじゃないのに隣のお兄さんがアリスってよんできてなんか怖い～ [DL版]",
        worksetId: 1,
        worksetIndex: 10,
        createdAt: "TIME1",
        description: "这是一个模拟的项目描述",
        updatedAt: "TIME2",
      },
      {
        allowAutoJoin: true,
        id: 122,
        isHidden: false,
        isPublished: false,
        labors: [
          {
            joinedTime: "MOCKTIME3",
            laborRole: 1,
            nickname: "翻译员2",
            userId: 2,
          },
          {
            joinedTime: "MOCKTIME4",
            laborRole: 3,
            nickname: "嵌字员1",
            userId: 5,
          },
        ],
        title: "[ しゅにち関数 ] 生徒達と仲良くHする本〜ブルアカ総集編〜",
        legacyId: 1410,
        moetranId: "mock-project-2",
        status: 66,
        worksetId: 1,
        worksetIndex: 12,
        createdAt: "TIME1",
        description: "这是一个模拟的项目描述",
        updatedAt: "TIME2",
      },
      {
        allowAutoJoin: true,
        id: 123,
        isHidden: false,
        isPublished: false,
        labors: [
          {
            joinedTime: "MOCKTIME3",
            laborRole: 1,
            nickname: "翻译员2",
            userId: 2,
          },
          {
            joinedTime: "MOCKTIME4",
            laborRole: 3,
            nickname: "嵌字员1",
            userId: 5,
          },
        ],
        title: "[ しゅにち関数 ] 生徒達と仲良くHする本〜ブルアカ総集編〜",
        legacyId: 1411,
        moetranId: "mock-project-2",
        status: 66,
        worksetId: 2,
        worksetIndex: 8,
        createdAt: "TIME1",
        description: "这是一个模拟的项目描述",
        updatedAt: "TIME2",
      },
    ];
  },

  getFiles: async (projectId: number) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return [
      {
        id: `68923d5a77c1d93171aa4322`,
        name: `文件_${projectId}_1.jpg`,
        coverUrl:
          "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400",
        fullUrl:
          "https://cdn.cartoonporn.to/nhentai/storage/images/614031/1.webp",
        sourceCount: 10,
        translatedSourceCount: 8,
        checkedSourceCount: 5,
      },
      {
        id: `project_${projectId}_file_2`,
        name: `文件_${projectId}_2.jpg`,
        coverUrl:
          "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400",
        fullUrl:
          "https://cdn.cartoonporn.to/nhentai/storage/images/614031/4.webp",
        sourceCount: 12,
        translatedSourceCount: 1,
        checkedSourceCount: 0,
      },
      {
        id: `project_${projectId}_file_3`,
        name: `文件_${projectId}_3.jpg`,
        coverUrl:
          "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=400",
        fullUrl:
          "https://cdn.cartoonporn.to/nhentai/storage/images/614031/25.webp",
        sourceCount: 11,
        translatedSourceCount: 0,
        checkedSourceCount: 0,
      },
      {
        id: `project_${projectId}_file_4`,
        name: `文件_${projectId}_4.jpg`,
        coverUrl:
          "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=400",
        fullUrl:
          "1",
        sourceCount: 0,
        translatedSourceCount: 0,
        checkedSourceCount: 0,
      },
      {
        id: `project_${projectId}_file_4`,
        name: `文件_${projectId}_4.jpg`,
        coverUrl:
          "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=400",
        fullUrl:
          "1",
        sourceCount: 0,
        translatedSourceCount: 0,
        checkedSourceCount: 0,
      },
      {
        id: `project_${projectId}_file_4`,
        name: `文件_${projectId}_4.jpg`,
        coverUrl:
          "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=400",
        fullUrl:
          "1",
        sourceCount: 0,
        translatedSourceCount: 0,
        checkedSourceCount: 0,
      },
      {
        id: `project_${projectId}_file_4`,
        name: `文件_${projectId}_4.jpg`,
        coverUrl:
          "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=400",
        fullUrl:
          "1",
        sourceCount: 0,
        translatedSourceCount: 0,
        checkedSourceCount: 0,
      },
      {
        id: `project_${projectId}_file_4`,
        name: `文件_${projectId}_4.jpg`,
        coverUrl:
          "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=400",
        fullUrl:
          "1",
        sourceCount: 0,
        translatedSourceCount: 0,
        checkedSourceCount: 0,
      },
      {
        id: `project_${projectId}_file_4`,
        name: `文件_${projectId}_4.jpg`,
        coverUrl:
          "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=400",
        fullUrl:
          "1",
        sourceCount: 0,
        translatedSourceCount: 0,
        checkedSourceCount: 0,
      }
    ];
  },

  getTimeBasedStatistics: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return generateTimeBasedMockData();
  },

  // 新增：同步项目相关的模拟API
  syncProjects: async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 模拟同步耗时
    return {
      success: true,
      syncedCount: 15,
      newCount: 3,
      updatedCount: 12,
      errors: [],
      lastSyncTime: new Date().toISOString(),
    };
  },

  getSyncedProjects: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateSyncedProjectsMockData();
  },

  getProjectTags: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        id: "1",
        name: "未分组",
        color: "#3b82f6",
        description: "未分组",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "R18",
        color: "#10b981",
        description: "R18",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "3",
        name: "C105",
        color: "#f59e0b",
        description: "C105",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "4",
        name: "C104",
        color: "#8b5cf6",
        description: "C104",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "5",
        name: "COMIC专栏（C103 + VeryLongPlaceholder123456）",
        color: "#ef4444",
        description: "成人向作品",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
  },

  // 成员管理相关的模拟API
  getProjectMembers: async (projectId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const projects = await mockApi.getProjects();
    const project = projects.find((p) => p.id === projectId);
    return project?.members || [];
  },

  applyToProject: async (projectId: string, roles: any[], message?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: `app_${Date.now()}`,
      projectId,
      userId: "2", // 当前用户
      user: {
        id: "2",
        name: "user",
        email: "user@example.com",
        isAdmin: false,
      },
      requestedRoles: roles,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  },

  getProjectApplications: async (projectId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        id: "app_1",
        projectId,
        userId: "3",
        user: {
          id: "3",
          name: "用户3",
          email: "user3@example.com",
          isAdmin: false,
        },
        requestedRoles: ["translator"],
        message: "我想参与这个项目的翻译工作",
        status: "pending",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "app_2",
        projectId,
        userId: "4",
        user: {
          id: "4",
          name: "用户4",
          email: "user4@example.com",
          isAdmin: false,
        },
        requestedRoles: ["proofreader", "reviewer"],
        message: "希望能担任校对和审核工作",
        status: "pending",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },

  handleApplication: async (
    applicationId: string,
    action: "approve" | "reject"
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: applicationId,
      status: action === "approve" ? "approved" : "rejected",
      reviewedAt: new Date().toISOString(),
      reviewedBy: "1",
    };
  },

  inviteToProject: async (
    projectId: string,
    userId: string,
    roles: any[],
    message?: string
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const users = generateMockUsers();
    const user = users.find((u) => u.id === userId);

    return {
      id: `inv_${Date.now()}`,
      projectId,
      inviterId: "1",
      inviterName: "admin", // 添加邀请人姓名
      invitedUserId: userId,
      invitedUser: user,
      assignedRoles: roles,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  },

  getUserInvitations: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        id: "inv_1",
        projectId: "1",
        inviterId: "1",
        inviterName: "admin", // 添加邀请人姓名
        invitedUserId: "2",
        invitedUser: {
          id: "2",
          name: "user",
          email: "user@example.com",
          isAdmin: false,
        },
        assignedRoles: ["translator"],
        message: "邀请你参与翻译工作",
        status: "pending",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },

  respondToInvitation: async (
    invitationId: string,
    action: "accept" | "decline"
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: invitationId,
      status: action === "accept" ? "accepted" : "declined",
      respondedAt: new Date().toISOString(),
    };
  },

  removeMember: async (projectId: string, memberId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Mock implementation
  },

  updateMemberRoles: async (
    projectId: string,
    memberId: string,
    roles: any[]
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: memberId,
      roles,
      updatedAt: new Date().toISOString(),
    };
  },

  searchUsers: async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const users = generateMockUsers();
    return users
      .filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10);
  },

  // 团队相关的模拟API
  getUserTeams: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateMockTeams();
  },

  getTeamDetails: async (teamId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const teams = generateMockTeams();
    return teams.find((t) => t.id === teamId) || teams[0];
  },

  getTeamProjectSets: async (teamId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const teams = generateMockTeams();
    const team = teams.find((t) => t.id === teamId);
    return team?.projectSets || [];
  },

  getTeamStatistics: async (teamId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const teams = generateMockTeams();
    const team = teams.find((t) => t.id === teamId);

    if (!team) {
      throw new Error("团队不存在");
    }

    // 生成模拟统计数据
    const totalProjects = Math.floor(Math.random() * 20) + 10;
    const completedProjects = Math.floor(totalProjects * 0.6);
    const activeProjects = totalProjects - completedProjects;

    return {
      teamId,
      teamName: team.name,
      totalProjects,
      activeProjects,
      completedProjects,
      totalMembers: Math.floor(Math.random() * 15) + 5,
      completionRate: Math.round((completedProjects / totalProjects) * 100),
      recentActivity: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        completed: Math.floor(Math.random() * 3),
      })).reverse(),
    };
  },

  createTeam: async (teamData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: `team_${Date.now()}`,
      name: teamData.name,
      description: teamData.description,
      avatar: teamData.avatar,
      members: [],
      projects: [],
      projectSets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  joinTeam: async (teamId: string, inviteCode?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const teams = generateMockTeams();
    return teams.find((t) => t.id === teamId) || teams[0];
  },

  leaveTeam: async (teamId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Mock implementation
  },

  createProjectSet: async (projectSetData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: `ps_${Date.now()}`,
      name: projectSetData.name,
      description: projectSetData.description,
      teamId: projectSetData.teamId,
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  getTeamMembers: async (teamId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const users = generateMockUsers();
    return users.slice(0, 5).map((user, index) => ({
      id: `tm_${index}`,
      userId: user.id,
      user,
      teamId,
      role: index === 0 ? "admin" : "member",
      joinedAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: "active",
    }));
  },
};
