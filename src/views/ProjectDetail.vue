<template>
  <div class="project-detail">
    <div
      v-if="projectStore.project_detail_loading || !projectStore.projectDetail"
      class="flex justify-center py-12"
    >
      <el-skeleton :rows="10" animated />
    </div>

    <div class="space-y-6" v-else>
      <div class="flex items-center space-x-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ projectStore.projectDetail!.title }}
        </h1>
      </div>

      <!-- 完整视图 -->
      <div>
        <!-- 标签页 -->
        <el-tabs v-model="activeTab" class="project-detail-tabs">
          <el-tab-pane label="项目图片" name="files">
            <div
              v-if="projectStore.file_loading"
              class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              style="width: 60%"
            >
              <el-skeleton :rows="5" animated />
            </div>
            <div style="display: flex; gap: 1vw" v-else>
              <!-- 项目图片 -->
              <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                style="width: 60%"
              >
                <div
                  class="responsive-grid"
                >
                  <ProjectImageCard
                    v-for="(file, index) in projectStore.projectFile"
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
              <div
                v-if="focus_file === null"
                class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                style="width: 40%"
              >
                <div class="preview-placeholder">
                  <div class="placeholder-content">
                    <h3>选择图片预览</h3>
                    <p>点击左侧缩略图查看完整图片</p>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                style="width: 40%"
              >
                <div class="preview-header">
                  <div class="image-count">图片 {{ 1 + focus_file + page_size * (current_page - 1) }} / {{ total_files }}</div>
                  <el-button type="primary" @click="startTranslation">从此页开始汉化</el-button>
                </div>
                <div class="image-container">
                  <div class="full-image-wrapper">
                    <el-image
                      style="width: 100%; height: 100%"
                      :src="projectStore.projectFile[focus_file].fullUrl"
                      fit="contain"
                      :preview-src-list="[projectStore.projectFile[focus_file].fullUrl]"
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

const route = useRoute();
const router = useRouter();
const projectStore = useProjectsStore();

const activeTab = ref("files");

// 分页相关（缩略图）
const current_page = ref<number>(1);
const page_size = 15;
const total_files = ref<number>(67); // 总页数

// 项目状态
const project_status = ref<number[]>([]);

// 颜色主题
const color_theme_trans = ref<string>("");
const color_theme_check = ref<string>("");

// 目前焦点的完整图url
const focus_file = ref<number | null>(null);

// 开始翻译功能
const startTranslation = () => {
  // 这里添加开始翻译的逻辑
  ElMessage.success("开始汉化处理...");
};

// 分页处理
const handleCurrentPageChange = (page: number) => {
  current_page.value = page;
  // 这里添加分页逻辑
};

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
});
</script>

<style scoped>
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
  min-height: 750px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2vh;
  padding-bottom: 1vh;
  border-bottom: 1px solid #e5e7eb;
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