<template>
  <div class="project-detail">
    <div
      v-if="projectStore.project_detail_loading || !projectStore.project_detail"
      class="flex justify-center py-12"
    >
      <el-skeleton :rows="10" animated />
    </div>

    <div
      class="space-y-6"
      style="display: flex; flex-direction: column; height: 100%"
      v-else
    >
      <div class="title-container flex items-center space-x-4 mb-4">
        <el-button @click="routerBack" type="primary">返回</el-button>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ projectStore.project_detail!.title }}
        </h1>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <el-tabs
          v-model="activeTab"
          class="project-detail-tabs"
          tab-position="left"
        >
          <el-tab-pane label="项目图片" name="files">
            <div
              v-if="projectStore.file_loading"
              class="bg-white dark:bg-gray-800 rounded-lg shadow"
              style="width: 70%"
            >
              <el-skeleton :rows="5" animated />
            </div>
            <div class="resizable-container" v-else>
              <!-- 左侧项目图片区域 -->
              <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow resizable-left"
                :style="{ width: leftWidth + '%' }"
              >
                <div class="responsive-grid">
                  <div
                    v-for="(file, index) in projectStore.project_file_page"
                    :key="file.id"
                    style="position: relative"
                  >
                    <transition name="file-edit-bar">
                      <div class="file-edit-bar" v-if="file_edit_mode">
                        <el-checkbox
                          :model-value="
                            selected_files.includes(
                              index + (current_page - 1) * page_size
                            )
                          "
                          @update:modelValue="(val: boolean) => handleFileSelect(index, val)"
                          size="large"
                          class="edit-bar-checkbox"
                        />
                        <el-button
                          type="danger"
                          plain
                          :icon="Delete"
                          size="small"
                          class="edit-bar-delete"
                        ></el-button>
                      </div>
                    </transition>
                    <ProjectImageCard
                      :file="file"
                      :color_theme_trans="color_theme_trans"
                      :color_theme_check="color_theme_check"
                      @click="() => (focus_file = index)"
                    />
                  </div>
                </div>
                <div class="image-pagination">
                  <el-pagination
                    :page-size="15"
                    :pager-count="5"
                    layout="prev, pager, next"
                    :current-page="current_page"
                    @current-change="handleCurrentPageChange"
                    :total="total_files"
                    size="default"
                  />
                </div>
              </div>

              <!-- 可拖动的分隔栏 -->
              <div class="resize-handle" @mousedown="startResize">
                <div class="resize-line"></div>
              </div>

              <!-- 右侧预览区域 -->
              <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow resizable-right"
                :style="{
                  width: rightWidth + '%',
                  'min-width': file_edit_mode ? '35%' : '0',
                }"
              >
                <ProjectImageHeader
                  :focus_file="focus_file"
                  :file_edit_mode="file_edit_mode"
                  @update:file_edit_mode="handleFileEditModeChange"
                  :user_status="user_status"
                  :total_files="total_files"
                  :page_size="page_size"
                  :current_page="current_page"
                />

                <ProjectImagePreview
                  class="container-right"
                  :focus_file="focus_file"
                  :file_edit_mode="file_edit_mode"
                  :user_status="user_status"
                  :total_files="total_files"
                />

                <ProjectImageEdit
                  v-if="file_edit_mode"
                  class="container-right export-panel"
                  :selected_files="selected_files"
                  :total_files="total_files"
                />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="项目成员" name="members">
            <div class="members-container">
              <!-- 搜索框 -->
              <div class="search-container">
                <el-input
                  v-model="filter_username"
                  placeholder="搜索成员姓名..."
                  clearable
                  class="search-input"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>

              <!-- 成员网格 -->
              <div class="members-grid">
                <el-card
                  v-for="user in filteredUsers"
                  :key="user.userId"
                  class="member-card"
                  shadow="hover"
                >
                  <div class="member-content">
                    <el-image
                      class="member-avatar"
                      :src="user.avatar"
                      fit="cover"
                    />
                    <div class="member-info">
                      <div class="member-name">{{ user.nickname }}</div>
                      <el-tag class="member-role" size="large">
                        {{ generateRoleByMask(user.laborRole) }}
                      </el-tag>
                    </div>
                  </div>
                </el-card>
              </div>

              <!-- 无搜索结果提示 -->
              <div v-if="filteredUsers.length === 0" class="no-results">
                <el-empty description="没有找到匹配的成员" />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="项目详情" name="project">
            <div style="padding: 0 5px">
              <ProjectUserStatus
                :user_status="user_status"
                :user_labor="user_labor"
              />
            </div>

            <el-divider />

            <div
              style="
                display: flex;
                justify-content: space-between;
                padding: 0 5px;
              "
            >
              <div style="padding: 0 5px 10px 5px; width: 30%">
                <el-card shadow="hover" class="progress-card">
                  <template #header>
                    <div class="card-header">
                      <div style="align-items: center; display: flex">
                        <el-icon class="header-icon"><Document /></el-icon>
                        <span class="header-title">项目进度</span>
                      </div>
                    </div>
                  </template>

                  <div class="progress-content">
                    <!-- 环状进度条区域 -->
                    <div class="circular-progress-container">
                      <div class="circular-progress-wrapper">
                        <!-- 外层环：翻译进度 -->
                        <div class="progress-ring outer-ring">
                          <el-progress
                            type="circle"
                            :percentage="translationPercentage"
                            :width="160"
                            :stroke-width="8"
                            color="#409EFF"
                            :show-text="false"
                          />
                        </div>

                        <!-- 内层环：校对进度 -->
                        <div class="progress-ring inner-ring">
                          <el-progress
                            type="circle"
                            :percentage="checkPercentage"
                            :width="120"
                            :stroke-width="6"
                            color="#67C23A"
                            :show-text="false"
                          />
                        </div>
                      </div>

                      <!-- 进度说明 -->
                      <div class="progress-legend">
                        <div class="legend-item">
                          <div class="legend-color translation"></div>
                          <span class="legend-text"
                            >翻译进度 {{ translationPercentage }}%</span
                          >
                          <span class="legend-count"
                            >{{
                              projectStore.project_detail.translatedSourceCount
                            }}/{{
                              projectStore.project_detail.sourceCount
                            }}</span
                          >
                        </div>
                        <div class="legend-item">
                          <div class="legend-color check"></div>
                          <span class="legend-text"
                            >校对进度 {{ checkPercentage }}%</span
                          >
                          <span class="legend-count"
                            >{{
                              projectStore.project_detail.checkedSourceCount
                            }}/{{ projectStore.project_detail.sourceCount }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>
              <div style="width: 68%">
                <el-card shadow="hover" class="progress-card">
                  <template #header>
                    <div class="card-header">
                      <div style="align-items: center; display: flex">
                        <el-icon class="header-icon"><Document /></el-icon>
                        <span class="header-title">项目信息</span>
                      </div>
                      <ProjectProgressStatus
                        :status="projectStore.project_detail.status"
                        :is_published="projectStore.project_detail.isPublished"
                      />
                    </div>
                  </template>

                  <div class="project-info-content">
                    <!-- 项目名称 -->
                    <el-row class="info-row" :gutter="12" align="middle">
                      <el-col :span="4">
                        <el-text
                          class="info-label"
                          type="primary"
                          size="default"
                          tag="strong"
                        >
                          项目名称：
                        </el-text>
                      </el-col>
                      <el-col :span="16" class="info-value">
                        <el-text size="default">
                          {{ projectStore.project_detail.title }}
                        </el-text>
                      </el-col>
                      <el-col
                        :span="4"
                        style="display: flex; justify-content: flex-end"
                      >
                        <el-button
                          size="small"
                          :icon="DocumentCopy"
                          @click="copyProjectName"
                          plain
                        >
                          复制
                        </el-button>
                      </el-col>
                    </el-row>

                    <!-- 项目ID -->
                    <el-row class="info-row" align="middle">
                      <el-col :span="4">
                        <el-text
                          class="info-label"
                          type="primary"
                          size="default"
                          tag="strong"
                        >
                          项目ID：
                        </el-text>
                      </el-col>
                      <el-col :span="16" class="info-value">
                        <el-text size="default" type="info">
                          {{ projectStore.project_detail.worksetId }} -
                          {{ projectStore.project_detail.id }}
                        </el-text>
                      </el-col>
                      <el-col
                        :span="4"
                        style="display: flex; justify-content: flex-end"
                      >
                        <el-button
                          type="default"
                          size="small"
                          :icon="DocumentCopy"
                          @click="copyProjectId"
                          plain
                        >
                          复制
                        </el-button>
                      </el-col>
                    </el-row>

                    <!-- 项目介绍 -->
                    <el-row class="info-row">
                      <el-col :span="4">
                        <el-text
                          class="info-label"
                          type="primary"
                          size="default"
                          tag="strong"
                        >
                          项目介绍：
                        </el-text>
                      </el-col>
                      <el-col :span="20" class="info-value">
                        <el-text size="default" line-clamp="3">
                          {{
                            projectStore.project_detail.description ||
                            "暂无介绍"
                          }}
                        </el-text>
                      </el-col>
                    </el-row>

                    <!-- 自动加入设置 -->
                    <el-row class="info-row" align="middle">
                      <el-col :span="4">
                        <el-text
                          class="info-label"
                          type="primary"
                          size="default"
                          tag="strong"
                        >
                          自动加入：
                        </el-text>
                      </el-col>
                      <el-col :span="20" class="info-value">
                        <el-tag
                          :type="
                            projectStore.project_detail.autoJoin
                              ? 'success'
                              : 'warning'
                          "
                          size="default"
                          effect="light"
                        >
                          <el-icon style="margin-right: 4px">
                            <component
                              :is="
                                projectStore.project_detail.autoJoin
                                  ? 'Check'
                                  : 'Close'
                              "
                            />
                          </el-icon>
                          {{
                            projectStore.project_detail.autoJoin
                              ? "允许"
                              : "不允许"
                          }}
                        </el-tag>
                      </el-col>
                    </el-row>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useProjectsStore } from "@/stores/projects";
import ProjectImageCard from "@/components/ProjectImageCard.vue";
import { useAuthStore } from "@/stores/auth";
import { MemberLabor } from "@/types";
import { generateRoleByMask } from "@/utils/userAbility";
import { Delete, Search } from "@element-plus/icons-vue";
import ProjectImagePreview from "@/components/ProjectImagePreview.vue";
import ProjectImageEdit from "@/components/ProjectImageEdit.vue";
import ProjectImageHeader from "@/components/ProjectImageHeader.vue";
import ProjectUserStatus from "@/components/ProjectUserStatus.vue";
import ProjectProgressStatus from "@/components/ProjectProgressStatus.vue";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectsStore();
const authStore = useAuthStore();

const activeTab = ref("files");

// 分页相关（缩略图）
const current_page = ref<number>(1);
const page_size = 15;
const total_files = ref<number>(67); // 总页数

// 项目状态（进度等）
const project_status = ref<number[]>([]);

// 颜色主题
const color_theme_trans = ref<string>("");
const color_theme_check = ref<string>("");

// 目前焦点的完整图url
const focus_file = ref<number | null>(null);

// 多选图片
const selected_files = ref<number[]>([]);

// 是否处于图片编辑导出模式
const file_edit_mode = ref<boolean>(false);

// 用户对于该项目的分工信息
const user_labor = ref<MemberLabor | null>(null);

// 用户对于该项目的加入状态
// 0-未加入 1-已加入 2-申请中 3-受邀请中
const user_status = ref<number | null>(null);

// 项目成员的用户名搜索
const filter_username = ref<string>("");

// 拖拽布局
const leftWidth = ref<number>(70);
const rightWidth = ref<number>(30);
const isResizing = ref<boolean>(false);
const startX = ref<number>(0);
const startLeftWidth = ref<number>(0);

// 开始拖拽
const startResize = (e: MouseEvent) => {
  isResizing.value = true;
  startX.value = e.clientX;
  startLeftWidth.value = leftWidth.value;

  // 添加全局样式防止文本选择
  document.body.classList.add("resizing");

  // 添加全局事件监听
  document.addEventListener("mousemove", handleResize);
  document.addEventListener("mouseup", stopResize);

  // 防止默认行为
  e.preventDefault();
};

// 处理拖拽
const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return;

  const rect = document
    .querySelector(".resizable-container")!
    .getBoundingClientRect();
  const deltaX = e.clientX - startX.value;
  const containerWidthPx = rect.width;
  const deltaPercent = (deltaX / containerWidthPx) * 100;

  let newLeftWidth = startLeftWidth.value + deltaPercent;

  // 限制最小和最大宽度
  newLeftWidth = Math.max(20, Math.min(75, newLeftWidth));

  leftWidth.value = newLeftWidth;
  rightWidth.value = 100 - newLeftWidth;
};

// 停止拖拽
const stopResize = () => {
  isResizing.value = false;

  // 移除全局样式
  document.body.classList.remove("resizing");

  // 移除事件监听
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);

  // 记录拖拽比例
  localStorage.setItem("proj-detail-left", leftWidth.value.toString());
};

// 分页处理
const handleCurrentPageChange = (page: number) => {
  current_page.value = page;
  // 这里添加分页逻辑

  console.log(
    selected_files.value.includes(
      0 + current_page.value * page_size - page_size
    )
  );
};

// 修改图片编辑模式
const handleFileEditModeChange = (val: boolean) => {
  file_edit_mode.value = val;
  focus_file.value = null;
};

// 处理文件选择
const handleFileSelect = (index: number, isSelected: boolean) => {
  const globalIndex = index + (current_page.value - 1) * page_size;

  if (isSelected) {
    if (!selected_files.value.includes(globalIndex)) {
      selected_files.value.push(globalIndex);
    }
  } else {
    selected_files.value = selected_files.value.filter(
      (id) => id !== globalIndex
    );
  }

  selected_files.value.sort((a, b) => a - b);
};

// 过滤后的用户列表
const filteredUsers = computed(() => {
  if (!filter_username.value) {
    return projectStore.project_detail!.labors;
  }

  return projectStore.project_detail!.labors.filter((user) =>
    user.nickname.toLowerCase().includes(filter_username.value!.toLowerCase())
  );
});

// 回退路由
const routerBack = () => {
  router.back();
};

// 计算翻译进度百分比
const translationPercentage = computed(() => {
  const total = projectStore.project_detail!.sourceCount;
  const translated = projectStore.project_detail!.translatedSourceCount;
  return total > 0 ? Math.round((translated / total) * 100) : 0;
});

// 计算校对进度百分比
const checkPercentage = computed(() => {
  const total = projectStore.project_detail!.sourceCount;
  const checked = projectStore.project_detail!.checkedSourceCount;
  return total > 0 ? Math.round((checked / total) * 100) : 0;
});

onMounted(async () => {
  // 获取项目详情
  const projectId = Number(route.params.id as string);
  if (projectId) {
    await projectStore.fetchProject(projectId);
  } else {
    ElMessage.error("不是合法的项目id");
    router.push("/projects");
  }

  // 获取颜色主题
  color_theme_trans.value =
    localStorage.getItem("color-theme-trans") || "#3b82f6";
  color_theme_check.value =
    localStorage.getItem("color-theme-check") || "#fa5555";

  // 获取拖拽比例
  leftWidth.value = Number(localStorage.getItem("proj-detail-left") || 70);
  rightWidth.value = 100 - leftWidth.value;

  // 获取项目文件
  await projectStore.fetchProjectFiles(projectId);
  user_status.value = 0;

  // 随后查看用户对于此项目的权限
  user_labor.value =
    projectStore.project_detail!.labors.find(
      (item) => item.userId === authStore.user_detail!.id
    ) || null;
  if (user_labor.value) user_status.value = 1;

  // 查看用户在此项目上的申请/邀请状态
  // TODO by influ3nza: 请求两次，获得用户的项目申请/邀请状态，并修改user_status
});
</script>

<style scoped>
html,
body {
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  box-sizing: border-box;
  overflow: hidden; /* 禁止页面整体滚动 */
}

main {
  max-width: 100% !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  box-sizing: border-box;
}
</style>

<style scoped>
/* 拖拽布局 */
.resizable-container {
  display: flex;
  gap: 0;
  padding-bottom: 5px;
  height: 100%;
}

.resizable-left {
  min-width: 20%;
  max-width: 80%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative; /* 新增：作为分页栏的定位容器 */
  padding-bottom: 60px; /* 新增：预留分页栏高度的空间 */
}

.resizable-right {
  min-width: 20%;
  max-width: 80%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem;
  padding-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.resize-handle {
  width: 8px;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  position: relative;
  user-select: none;
  height: 100%;
}

.resize-handle:hover .resize-line {
  background-color: #409eff;
  width: 3px;
}

.resize-line {
  width: 1px;
  height: 100%;
  background-color: #dcdfe6;
  transition: all 0.2s ease;
  border-radius: 1px;
}

.resize-handle:active .resize-line {
  background-color: #409eff;
  width: 3px;
}

/* 拖拽时的全局样式 */
.resizing {
  cursor: col-resize !important;
  user-select: none !important;
}

.resizing * {
  cursor: col-resize !important;
  user-select: none !important;
}

/* 项目成员 */
.members-container {
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
}

.search-container {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  height: 40px;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.member-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.member-card:hover {
  transform: translateY(-2px);
}

.member-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
}

.member-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 1rem;
  object-fit: cover;
}

.member-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.member-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--el-text-color-primary);
  margin-bottom: 0.25rem;
}

.member-role {
  font-size: 0.75rem;
}

.no-results {
  margin-top: 2rem;
  text-align: center;
}

/* 状态特定的样式调整 */
.status-alert.el-alert--error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
}

.status-alert.el-alert--success {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.status-alert.el-alert--warning {
  background-color: #fffbeb;
  border: 1px solid #fed7aa;
}

.status-alert.el-alert--info {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
}

/* 项目详情 */
.project-detail {
  padding: 2vh 3vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 图片编辑栏 */
.file-edit-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px 5px 15px;
  position: absolute;
  left: 0px;
  top: 0px;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 100;
  width: 100%;
  border-radius: 1vw 1vw 0 0;
}

.file-edit-bar-enter-active {
  animation: expandIn 0.2s ease-out;
}

.file-edit-bar-leave-active {
  animation: expandOut 0.2s ease-out;
}

@keyframes expandIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes expandOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 自定义复选框样式 */
.edit-bar-checkbox {
  --el-checkbox-font-size: 16px;
}

.edit-bar-checkbox :deep(.el-checkbox__input) {
  transform: scale(1.1);
}

.edit-bar-checkbox :deep(.el-checkbox__inner) {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  background-color: transparent;
  transition: all 0.3s ease;
}

.edit-bar-checkbox :deep(.el-checkbox__inner:hover) {
  border-color: rgba(255, 255, 255, 0.9);
  background-color: rgba(255, 255, 255, 0.1);
}

.edit-bar-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #409eff;
  border-color: #409eff;
}

.edit-bar-checkbox
  :deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #fff;
  border-width: 2px;
}

/* 自定义删除按钮样式 */
.edit-bar-delete {
  width: 32px;
  height: 32px;
  border: none;
  background-color: transparent;
  color: rgba(245, 108, 108, 0.9);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.edit-bar-delete:hover {
  background-color: rgba(245, 108, 108, 0.15);
  /* border-color: #f56c6c; */
  color: #f56c6c;
  transform: scale(1.05);
}

/* 图片分页 */
.image-pagination {
  width: 100%;
  display: flex;
  padding: 1vh 2vw;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0 0 12px 12px;
  border-top: 1px solid #e2e8f0;
  justify-content: center;
  height: 60px;
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

/* 侧边分栏 */
.project-detail-tabs {
  flex: 1;
  display: flex;
  min-height: 0;
}

.project-detail-tabs :deep(.el-tabs__content) {
  padding: 10px 5px 0;
  height: 100%;
  overflow: hidden;
}

.project-detail-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow: hidden;
}

/* 右侧图片占位 */
.container-right {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 5px 0 rgb(0 0 0 / 0.2), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  margin-top: 1rem;
  width: 100%;
  height: 100%;
}

.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  overflow-y: auto;
  padding: 10px;
}

.preview-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  border-bottom: 1px solid #e5e7eb;
  gap: 1vh;
  flex-shrink: 0;
}

.image-count {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

/* 暗色主题 */
.dark .placeholder-content h3 {
  color: #f9fafb;
}

.dark .placeholder-content p {
  color: #d1d5db;
}

.dark .image-count {
  color: #d1d5db;
}

.dark .preview-header {
  border-bottom-color: #4b5563;
}

.export-panel {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--el-border-color-light);
}
.progress-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.progress-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  justify-content: space-between;
  align-items: center;
}

.header-icon {
  margin-right: 8px;
  color: var(--el-color-primary);
  font-size: 18px;
}

.header-title {
  font-size: 18px;
  color: var(--el-text-color-primary);
}

.project-info-content {
  padding: 4px 0;
}

.info-row {
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.info-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  white-space: nowrap;
}

.info-value {
  word-break: break-all;
  display: flex;
  align-items: center;
}

.circular-progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.circular-progress-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  height: 200px;
}

.progress-ring {
  position: absolute;
}

.outer-ring {
  z-index: 1;
}

.inner-ring {
  z-index: 2;
}

.progress-legend {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  flex-direction: column;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-color.translation {
  background-color: #409eff;
}

.legend-color.check {
  background-color: #67c23a;
}

.legend-text {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.legend-count {
  font-size: 16px;
  color: #909399;
  margin-left: 4px;
}

/* 环形进度条动画 */
:deep(.el-progress-circle__path) {
  transition: stroke-dasharray 0.6s ease;
}
</style>
