import { defineStore } from "pinia";
import { ref, computed, toRaw } from "vue";
import type {
  ProjectBasic,
  ProjectDetail,
  ProjectFile,
  ProjectProgress,
} from "@/types";
import { projectApi } from "@/api/projects";
import { useTeamsStore } from "@/stores/teams";

export const useProjectsStore = defineStore(
  "projects",
  () => {
    const projects_page = ref<ProjectBasic[]>([]); // 单页项目信息
    const project_detail = ref<ProjectDetail | null>(null); // 单个项目详细信息
    const project_file_page = ref<ProjectFile[]>([]); // 单页项目文件信息

    const projects_page_loading = ref<boolean>(false); // 项目分页是否正在加载
    const project_detail_loading = ref<boolean>(false); // 项目详细是否正在加载
    const file_loading = ref<boolean>(false); // 项目文件是否正在加载

    const error = ref<string | null>(null);

    // 根据当前团队和项目集筛选项目
    const filteredProjects = computed(() => {
      let filtered = projects_page.value;

      return toRaw(filtered);
    });

    const activeProjects = computed(() =>
      filteredProjects.value.filter((_) => true)
    );

    const completedProjects = computed(() =>
      filteredProjects.value.filter((_) => true)
    );

    const fetchProjects = async () => {
      projects_page_loading.value = true;
      error.value = null;

      try {
        const response = await projectApi.getProjects();
        projects_page.value = response;
      } catch (err: any) {
        error.value = err.message || "获取项目列表失败";
      } finally {
        projects_page_loading.value = false;
      }
    };

    const fetchProject = async (id: number) => {
      project_detail_loading.value = true;
      error.value = null;

      try {
        const project = await projectApi.getProject(id);
        project_detail.value = project;
        return project;
      } catch (err: any) {
        error.value = err.message || "获取项目详情失败";
        return null;
      } finally {
        project_detail_loading.value = false;
      }
    };

    const fetchProjectFiles = async (id: number) => {
      file_loading.value = true;
      error.value = null;

      try {
        const files = await projectApi.getFiles(id);
        project_file_page.value = files;
        return files;
      } catch (err: any) {
        error.value = err.message || "获取项目文件失败";
        return null;
      } finally {
        file_loading.value = false;
      }
    };

    const updateProjectProgress = async (
      projectId: string,
      progress: Partial<ProjectProgress>
    ) => {
      try {
        const updatedProject = await projectApi.updateProgress(
          projectId,
          progress
        );

        // Update local state
        const index = projects_page.value.findIndex((_) => true);
        // if (index !== -1) {
        //   projects_page.value[index] = updatedProject;
        // }

        // if (currentProject.value?.id === projectId) {
        //   currentProject.value = updatedProject;
        // }

        return updatedProject;
      } catch (err: any) {
        error.value = err.message || "更新项目进度失败";
        throw err;
      }
    };

    const createProject = async (projectData: Partial<Project>) => {
      isLoading.value = true;
      error.value = null;

      // try {
      //   // 添加当前团队和项目集信息
      //   const enrichedProjectData = {
      //     ...projectData,
      //     teamId: teamsStore.currentTeam?.id,
      //     projectSetId: teamsStore.currentProjectSet?.id,
      //   };

      //   const newProject = await projectApi.createProject(enrichedProjectData);
      //   projects_page.value.unshift(newProject);
      //   return newProject;
      // } catch (err: any) {
      //   error.value = err.message || "创建项目失败";
      //   throw err;
      // } finally {
      //   isLoading.value = false;
      // }
    };

    return {
      project_detail,
      projects_page,
      project_file_page,
      activeProjects,
      completedProjects,
      projects_page_loading,
      project_detail_loading,
      file_loading,
      error,
      fetchProjects,
      fetchProject,
      fetchProjectFiles,
      updateProjectProgress,
      createProject,
    };
  },
  {
    persist: {
      storage: sessionStorage,
    },
  }
);
