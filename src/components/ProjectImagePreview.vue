<template>
  <div
    v-if="focus_file === null && !file_edit_mode"
    class="preview-placeholder"
  >
    <h3>选择图片预览</h3>
    <p>点击左侧缩略图查看完整图片</p>
    <p>共{{ total_files }}页</p>
  </div>
  <div class="image-container" v-if="focus_file !== null && !file_edit_mode">
    <div class="full-image-wrapper">
      <el-image
        style="width: 100%; height: 100%"
        :src="projectStore.project_file_page[focus_file!].fullUrl"
        fit="contain"
        :preview-src-list="
          projectStore.project_file_page.map((item) => item.fullUrl)
        "
        :initial-index="focus_file"
        show-progress
        hide-on-click-modal
        :infinite="false"
        class="full-image"
      >
        <template #placeholder>
          <el-skeleton :rows="5" animated />
        </template>
        <template #toolbar="{}">
          <el-button
            type="primary"
            @click="startTranslation"
            :disabled="user_status !== 1"
            >{{
              user_status === 1 ? "从此页开始汉化" : "非本项目成员不得操作"
            }}</el-button
          >
        </template>
      </el-image>
      <div class="image-overlay">
        <div class="overlay-content">
          <span>点击放大查看</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
import { useProjectsStore } from "@/stores/projects";

interface Props {
  focus_file: number | null;
  file_edit_mode: boolean;
  user_status: number | null;
  total_files: number;
}

const props = defineProps<Props>();
const projectStore = useProjectsStore();

// 开始翻译功能
const startTranslation = () => {
  router.push(
    `/translator/${projectStore.project_detail?.moetranId}/${
      projectStore.project_file_page[props.focus_file!].id
    }`
  );
};
</script>

<style scoped>
.preview-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 10px;
}

.preview-placeholder h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1vh 0;
  color: #374151;
}

.preview-placeholder p {
  font-size: 1rem;
  margin: 0;
  color: #6b7280;
}

.image-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10px 0 10px 0;
  overflow-y: auto;
  margin-top: 12px;
}

.full-image-wrapper {
  position: relative;
  width: 100%;
  max-width: 95%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.full-image {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-image-viewer__btn) {
  opacity: 1;
}

:deep(.el-image-viewer__actions__inner .el-button) {
  font-size: 18px;
  margin-top: 5px;
  margin-bottom: 5px;
}

/* 蒙版样式 */
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
  pointer-events: none;
}

.full-image-wrapper:hover .image-overlay {
  opacity: 0.5;
}

.overlay-content {
  text-align: center;
  color: white;
  pointer-events: none;
}

.overlay-content span {
  font-size: 1rem;
  font-weight: 500;
}
</style>
