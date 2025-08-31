import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  ProjectMember,
  ProjectApplication,
  ProjectInvitation,
  ProjectRole,
  User,
} from "@/types";
import { membersApi } from "@/api/members";

export const useMembersStore = defineStore(
  "members",
  () => {
    const projectMembers = ref<Record<string, ProjectMember[]>>({});
    const projectApplications = ref<Record<string, ProjectApplication[]>>({});
    const userInvitations = ref<ProjectInvitation[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // 获取项目成员
    const fetchProjectMembers = async (projectId: string) => {
      isLoading.value = true;
      error.value = null;

      try {
        const members = await membersApi.getProjectMembers(projectId);
        projectMembers.value[projectId] = members;
      } catch (err: any) {
        error.value = err.message || "获取项目成员失败";
      } finally {
        isLoading.value = false;
      }
    };

    // 申请加入项目
    const applyToProject = async (
      projectId: string,
      roles: ProjectRole[],
      message?: string
    ) => {
      try {
        const application = await membersApi.applyToProject(
          projectId,
          roles,
          message
        );

        // 更新本地申请列表
        if (!projectApplications.value[projectId]) {
          projectApplications.value[projectId] = [];
        }
        projectApplications.value[projectId].unshift(application);

        return application;
      } catch (err: any) {
        error.value = err.message || "申请失败";
        throw err;
      }
    };

    // 获取项目申请列表
    const fetchProjectApplications = async (projectId: string) => {
      try {
        const applications = await membersApi.getProjectApplications(projectId);
        projectApplications.value[projectId] = applications;
      } catch (err: any) {
        error.value = err.message || "获取申请列表失败";
      }
    };

    // 处理项目申请
    const handleApplication = async (
      applicationId: string,
      action: "approve" | "reject"
    ) => {
      try {
        const result = await membersApi.handleApplication(
          applicationId,
          action
        );

        // 更新本地申请状态
        Object.keys(projectApplications.value).forEach((projectId) => {
          const applications = projectApplications.value[projectId];
          const index = applications.findIndex(
            (app) => app.id === applicationId
          );
          if (index !== -1) {
            applications[index] = { ...applications[index], ...result };
          }
        });

        return result;
      } catch (err: any) {
        error.value = err.message || "处理申请失败";
        throw err;
      }
    };

    // 邀请用户加入项目
    const inviteToProject = async (
      projectId: string,
      userId: string,
      roles: ProjectRole[],
      message?: string
    ) => {
      try {
        const invitation = await membersApi.inviteToProject(
          projectId,
          userId,
          roles,
          message
        );
        return invitation;
      } catch (err: any) {
        error.value = err.message || "邀请失败";
        throw err;
      }
    };

    // 获取用户收到的邀请
    const fetchUserInvitations = async () => {
      try {
        const invitations = await membersApi.getUserInvitations();
        userInvitations.value = invitations;
      } catch (err: any) {
        error.value = err.message || "获取邀请失败";
      }
    };

    // 响应项目邀请
    const respondToInvitation = async (
      invitationId: string,
      action: "accept" | "decline"
    ) => {
      try {
        const result = await membersApi.respondToInvitation(
          invitationId,
          action
        );

        // 更新本地邀请状态
        const index = userInvitations.value.findIndex(
          (inv) => inv.id === invitationId
        );
        if (index !== -1) {
          userInvitations.value[index] = {
            ...userInvitations.value[index],
            ...result,
          };
        }

        return result;
      } catch (err: any) {
        error.value = err.message || "响应邀请失败";
        throw err;
      }
    };

    // 移除项目成员
    const removeMember = async (projectId: string, memberId: string) => {
      try {
        await membersApi.removeMember(projectId, memberId);

        // 更新本地成员列表
        if (projectMembers.value[projectId]) {
          projectMembers.value[projectId] = projectMembers.value[
            projectId
          ].filter((member) => member.id !== memberId);
        }
      } catch (err: any) {
        error.value = err.message || "移除成员失败";
        throw err;
      }
    };

    // 更新成员角色
    const updateMemberRoles = async (
      projectId: string,
      memberId: string,
      roles: ProjectRole[]
    ) => {
      try {
        const result = await membersApi.updateMemberRoles(
          projectId,
          memberId,
          roles
        );

        // 更新本地成员信息
        if (projectMembers.value[projectId]) {
          const index = projectMembers.value[projectId].findIndex(
            (member) => member.id === memberId
          );
          if (index !== -1) {
            projectMembers.value[projectId][index] = {
              ...projectMembers.value[projectId][index],
              ...result,
            };
          }
        }

        return result;
      } catch (err: any) {
        error.value = err.message || "更新角色失败";
        throw err;
      }
    };

    // 搜索用户
    const searchUsers = async (query: string): Promise<User[]> => {
      try {
        return await membersApi.searchUsers(query);
      } catch (err: any) {
        error.value = err.message || "搜索用户失败";
        return [];
      }
    };

    // 获取角色权限
    const getRolePermissions = (roles: ProjectRole[]) => {
      const permissions = {
        canTranslate: roles.includes("translator"),
        canProofread: roles.includes("proofreader"),
        canViewTranslations: roles.length > 0, // 任何角色都可以查看翻译
        canSetTypesettingStatus: roles.includes("typesetter"),
        canSetReviewStatus: roles.includes("reviewer"),
        canExportFiles: roles.includes("typesetter"), // 嵌字可以导出文件
        canManageMembers: false, // 只有项目负责人可以管理成员
        canEditProject: false, // 只有项目负责人可以编辑项目
      };

      return permissions;
    };

    // 获取角色显示名称
    const getRoleDisplayName = (role: ProjectRole) => {
      const roleNames = {
        translator: "翻译",
        proofreader: "校对",
        typesetter: "嵌字",
        reviewer: "审核",
      };
      return roleNames[role] || role;
    };

    // 计算属性
    const getProjectMembers = (projectId: string) => {
      return projectMembers.value[projectId] || [];
    };

    const getProjectApplications = (projectId: string) => {
      return projectApplications.value[projectId] || [];
    };

    const pendingInvitations = computed(() => {
      return userInvitations.value.filter((inv) => inv.status === "pending");
    });

    return {
      projectMembers: computed(() => projectMembers.value),
      projectApplications: computed(() => projectApplications.value),
      userInvitations: computed(() => userInvitations.value),
      pendingInvitations,
      isLoading: computed(() => isLoading.value),
      error: computed(() => error.value),
      fetchProjectMembers,
      applyToProject,
      fetchProjectApplications,
      handleApplication,
      inviteToProject,
      fetchUserInvitations,
      respondToInvitation,
      removeMember,
      updateMemberRoles,
      searchUsers,
      getRolePermissions,
      getRoleDisplayName,
      getProjectMembers,
      getProjectApplications,
    };
  },
  {
    persist: true,
  }
);
