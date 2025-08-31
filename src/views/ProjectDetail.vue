<template>
  <div class="project-detail">
    <div
      v-if="projectStore.project_detail_loading || !projectStore.project_detail"
      class="flex justify-center py-12"
    >
      <el-skeleton :rows="10" animated />
    </div>

    <div class="space-y-6" v-else>
      <div class="flex items-center space-x-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ projectStore.project_detail!.title }}
        </h1>
      </div>

      <!-- 正在加载中 -->
      <el-alert
        v-if="user_status === null"
        type="info"
        :closable="false"
        show-icon
        class="status-alert"
      >
        <template #default>
          <div class="alert-content">
            <span>正在获取你的项目状态，屏气凝神！</span>
            <el-button
              type="info"
              disabled
              size="default"
              class="action-button"
            >
              正在加载中
            </el-button>
          </div>
        </template>
      </el-alert>

      <!-- 未加入项目状态 -->
      <el-alert
        v-if="user_status === 0"
        type="error"
        :closable="false"
        show-icon
        class="status-alert"
      >
        <template #default>
          <div class="alert-content">
            <span>你还未加入此项目</span>
            <el-button
              type="primary"
              size="default"
              icon="Plus"
              @click=""
              class="action-button"
            >
              加入项目
            </el-button>
          </div>
        </template>
      </el-alert>

      <!-- 已加入项目状态 -->
      <el-alert
        v-if="user_status === 1"
        type="success"
        :closable="false"
        show-icon
        class="status-alert"
      >
        <template #title>
          <div class="alert-content">
            <div class="status-text">
              <span>你已于{{ user_labor!.joinedTime }}加入此项目，角色为</span>
              <el-tag type="success" size="small" class="role-tag">
                {{ generateRoleByMask(user_labor!.laborRole) }}
              </el-tag>
            </div>
            <el-button
              type="success"
              size="default"
              icon="Select"
              disabled
              class="action-button"
            >
              已加入
            </el-button>
          </div>
        </template>
      </el-alert>

      <!-- 已发出申请状态 -->
      <el-alert
        v-if="user_status === 2"
        type="warning"
        :closable="false"
        show-icon
        class="status-alert"
      >
        <template #default>
          <div class="alert-content">
            <span>你已向负责人发出申请</span>
            <el-button
              type="warning"
              size="default"
              icon="Clock"
              disabled
              loading
              class="action-button"
            >
              等待审核
            </el-button>
          </div>
        </template>
      </el-alert>

      <!-- 收到邀请状态 -->
      <el-alert
        v-if="user_status === 3"
        type="info"
        :closable="false"
        show-icon
        class="status-alert"
      >
        <template #default>
          <div class="alert-content">
            <span>你已收到负责人的邀请</span>
            <div class="button-group">
              <el-button
                type="primary"
                size="default"
                icon="Check"
                @click=""
                class="action-button"
              >
                同意邀请
              </el-button>
              <el-button
                type="danger"
                size="default"
                icon="Close"
                plain
                @click=""
                class="action-button"
              >
                拒绝
              </el-button>
            </div>
          </div>
        </template>
      </el-alert>

      <!-- 完整视图 -->
      <div>
        <!-- 标签页 -->
        <el-tabs v-model="activeTab" class="project-detail-tabs">
          <el-tab-pane label="项目图片" name="files">
            <div
              v-if="projectStore.file_loading"
              class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              style="width: 70%"
            >
              <el-skeleton :rows="5" animated />
            </div>
            <div class="resizable-container" v-else>
              <!-- 左侧项目图片区域 -->
              <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 resizable-left"
                :style="{ width: leftWidth + '%' }"
              >
                <div class="responsive-grid">
                  <ProjectImageCard
                    v-for="(file, index) in projectStore.project_file_page"
                    :file="file"
                    :color_theme_trans="color_theme_trans"
                    :color_theme_check="color_theme_check"
                    @click="() => (focus_file = index)"
                  />
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
                class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 resizable-right"
                :style="{ width: rightWidth + '%' }"
              >
                <div class="preview-header">
                  <div
                    style="display: flex; align-items: center; width: 100%"
                    :style="{
                      'justify-content':
                        focus_file !== null && !file_edit_mode
                          ? 'space-between'
                          : 'right',
                    }"
                  >
                    <div
                      v-if="focus_file !== null && !file_edit_mode"
                      class="image-count"
                    >
                      图片
                      {{ 1 + focus_file + page_size * (current_page - 1) }} /
                      {{ total_files }}
                    </div>
                    <el-switch
                      v-model="file_edit_mode"
                      active-text="编辑/导出/上传"
                      inactive-text="浏览模式"
                      @change="handleFileEditModeChange"
                    />
                  </div>
                  <el-button
                    v-if="focus_file !== null && !file_edit_mode"
                    style="width: 100%"
                    type="primary"
                    @click="startTranslation"
                    :disabled="user_status !== 1"
                    >{{
                      user_status === 1
                        ? "从此页开始汉化"
                        : "非本项目成员不得操作"
                    }}</el-button
                  >
                </div>
                <div
                  v-if="focus_file === null && !file_edit_mode"
                  class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                  style="width: 100%"
                >
                  <div class="preview-placeholder">
                    <div class="placeholder-content">
                      <h3>选择图片预览</h3>
                      <p>点击左侧缩略图查看完整图片</p>
                      <p>共{{ total_files }}页</p>
                    </div>
                  </div>
                </div>
                <div
                  v-if="focus_file !== null && !file_edit_mode"
                  class="bg-white dark:bg-gray-800 rounded-lg"
                  style="width: 100%"
                >
                  <div class="image-container">
                    <div class="full-image-wrapper">
                      <el-image
                        style="width: 100%; height: 100%"
                        :src="
                          projectStore.project_file_page[focus_file].fullUrl
                        "
                        fit="contain"
                        :preview-src-list="[
                          projectStore.project_file_page[focus_file].fullUrl,
                        ]"
                        class="full-image"
                      >
                        <template #placeholder>
                          <el-skeleton :rows="5" animated />
                        </template>
                      </el-image>
                      <div class="image-overlay">
                        <div class="overlay-content">
                          <span>点击放大查看</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
          <el-tab-pane label="项目操作" name="project">
            <span>导出</span>
            <el-button>导出全部内容</el-button>
            <el-button>仅导出翻译数据</el-button>
            <span>危险区域</span>
            <el-button type="error">退出项目</el-button>
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
const leftWidth = ref<number>(70)
const rightWidth = ref<number>(30)
const isResizing = ref<boolean>(false)
const startX = ref<number>(0)
const startLeftWidth = ref<number>(0)

// 开始拖拽
const startResize = (e: MouseEvent) => {
  isResizing.value = true;
  startX.value = e.clientX;
  startLeftWidth.value = leftWidth.value;

  // 添加全局样式防止文本选择
  document.body.classList.add('resizing');

  // 添加全局事件监听
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  
  // 防止默认行为
  e.preventDefault();
}

// 处理拖拽
const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return;

  const rect = document.querySelector('.resizable-container')!.getBoundingClientRect();
  const deltaX = e.clientX - startX.value;
  const containerWidthPx = rect.width;
  const deltaPercent = (deltaX / containerWidthPx) * 100;
  
  let newLeftWidth = startLeftWidth.value + deltaPercent;
  
  // 限制最小和最大宽度
  newLeftWidth = Math.max(20, Math.min(75, newLeftWidth));
  
  leftWidth.value = newLeftWidth;
  rightWidth.value = 100 - newLeftWidth;
}

// 停止拖拽
const stopResize = () => {
  isResizing.value = false;
  
  // 移除全局样式
  document.body.classList.remove('resizing');
  
  // 移除事件监听
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
}

// 开始翻译功能
const startTranslation = () => {
  router.push(
    `/translator/${projectStore.project_detail?.moetranId}/${
      projectStore.project_file_page[focus_file.value!].id
    }`
  );
};

// 分页处理
const handleCurrentPageChange = (page: number) => {
  current_page.value = page;
  // 这里添加分页逻辑
};

// 修改图片编辑模式
const handleFileEditModeChange = (val: boolean) => {
  file_edit_mode.value = val;
  focus_file.value = null;
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
/* 项目加入状态 */
.status-alert {
  border-radius: 8px;
  padding: 16px 20px;
}

.alert-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 16px;
}

.status-text {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.role-tag {
  margin-left: 8px;
  font-weight: 500;
}

.action-button {
  min-width: 100px;
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 8px;
}

/* 自定义alert样式 */
.status-alert :deep(.el-alert__content) {
  width: 100%;
  padding-right: 0;
}

.status-alert :deep(.el-alert__title) {
  width: 100%;
  margin-bottom: 0;
}

.status-alert :deep(.el-alert__description) {
  width: 100%;
  margin: 0;
  padding-top: 0;
}

/* 拖拽布局 */
.resizable-container {
  display: flex;
  gap: 0;
  padding-bottom: 5px;
  position: relative;
}

.resizable-left, .resizable-right {
  min-width: 20%;
  max-width: 80%;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .alert-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .status-text {
    justify-content: center;
    text-align: center;
  }

  .button-group {
    justify-content: center;
  }

  .action-button {
    flex: 1;
  }
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
}

.image-pagination {
  width: 100%;
  display: flex;
  padding: 2vh 2vw 0 2vw;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0 0 12px 12px;
  border-top: 1px solid #e2e8f0;
  justify-content: center;
}

.project-detail-tabs :deep(.el-tabs__content) {
  padding-top: 20px;
}

/* 预览占位符样式 */
.preview-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: #6b7280;
}

.placeholder-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1vh 0;
  color: #374151;
}

.placeholder-content p {
  font-size: 1rem;
  margin: 0;
  color: #6b7280;
}

.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

/* 预览头部 */
.preview-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  margin-bottom: 2vh;
  padding-bottom: 1vh;
  border-bottom: 1px solid #e5e7eb;
  gap: 1vh;
}

.image-count {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

/* 图片容器 */
.image-container {
  height: calc(100% - 6vh);
  display: flex;
  justify-content: center;
  align-items: center;
}

.full-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.full-image {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

/* 蒙版样式 - 修复点击问题 */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
  pointer-events: none; /* 关键：让蒙版不阻挡点击 */
}

.full-image-wrapper:hover .image-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
  color: white;
  pointer-events: none; /* 确保内容也不阻挡点击 */
}

.overlay-content span {
  font-size: 1rem;
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
</style>
