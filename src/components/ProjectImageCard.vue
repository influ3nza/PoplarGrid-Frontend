<template>
  <div 
    class="file-card"
  >
    <!-- 图片区域 -->
    <div class="image-container">
      <el-image
        class="card-image"
        :src="file.coverUrl"
        fit="cover"
        lazy
      >
        <template #error>
          <div class="image-error">
            <el-icon size="24"><Picture /></el-icon>
            <span>加载失败</span>
          </div>
        </template>
      </el-image>
      <!-- 悬停遮罩 -->
      <div class="hover-overlay">
        <el-icon size="20"><View /></el-icon>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 统计信息 -->
      <div class="stats-row">
        <div class="stat-item">
          <el-icon><CollectionTag /></el-icon>
          <span>{{ file.sourceCount }}</span>
        </div>
        <div class="stat-item">
          <el-icon><EditPen /></el-icon>
          <span>{{ file.translatedSourceCount }}</span>
        </div>
        <div class="stat-item">
          <el-icon><Select /></el-icon>
          <span>{{ file.checkedSourceCount }}</span>
        </div>
      </div>

      <!-- 双层进度条 -->
      <div class="progress-container">
        <!-- 底层进度条 (翻译进度) -->
        <div class="progress-bar progress-translate">
          <div 
            class="progress-fill translate-fill"
            :style="{ width: translateProgress + '%', background: color_theme_trans }"
          ></div>
        </div>
        <!-- 上层进度条 (检查进度) -->
        <div class="progress-bar progress-check">
          <div 
            class="progress-fill check-fill"
            :style="{ width: checkProgress + '%', background: color_theme_check }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ProjectFile } from "@/types";
import { computed, onMounted, ref } from "vue";
import { Picture, CollectionTag, EditPen, Select, View } from '@element-plus/icons-vue';

interface Props {
  file: ProjectFile;
  color_theme_trans: string;
  color_theme_check: string;
}

const props = defineProps<Props>();

// 计算翻译进度百分比
const translateProgress = computed(() => {
  if (props.file.sourceCount === 0) return 0;
  return (props.file.translatedSourceCount / props.file.sourceCount) * 100;
});

// 计算校对进度百分比
const checkProgress = computed(() => {
  if (props.file.sourceCount === 0) return 0;
  return (props.file.checkedSourceCount / props.file.sourceCount) * 100;
});
</script>

<style scoped>
.file-card {
  background: #ffffff;
  border-radius: 1vw;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 0.16vw 0.67vw rgba(0, 0, 0, 0.1);
  border: 0.1vw solid #f0f0f0;
  position: relative;
  display: flex;
  flex-direction: column;
}

.file-card:hover {
  transform: translateY(-0.33vw) scale(1.02);
  box-shadow: 0 1vw 2.67vw rgba(0, 0, 0, 0.15);
  border-color: #000000;
}

.file-card:active {
  transform: translateY(-0.16vw) scale(1.01);
  transition: transform 0.1s ease;
}

.image-container {
  position: relative;
  overflow: hidden;
  flex: 1;
}

.card-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.file-card:hover .card-image {
  transform: scale(1.05);
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 1vw;
  gap: 0.5vw;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
}

.file-card:hover .hover-overlay {
  opacity: 1;
}

.content-area {
  padding: 10px 10px 5px 10px;
  background: #ffffff;
}

.stats-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.67vw;
  padding: 0 0.3vw;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.2vw;
  font-size: 15px;
  color: #606266;
  font-weight: 600;
  transition: color 0.2s ease;
}

.stat-item .el-icon {
  font-size: 15px;
  transition: transform 0.2s ease;
}

.file-card:hover .stat-item .el-icon {
  transform: scale(1.1);
}

.progress-container {
  position: relative;
  height: 1vw;
}

.progress-bar {
  position: absolute;
  width: 100%;
  height: 0.5vw;
  border-radius: 0.25vw;
  overflow: hidden;
}

.progress-translate {
  top: 0;
  background-color: #e8f4fd;
}

.progress-check {
  top: 0;
  background-color: transparent;
}

.progress-fill {
  height: 100%;
  border-radius: 0.2vw;
  position: relative;
}

.translate-fill {
  box-shadow: 0 0.1vw 0.25vw rgba(103, 194, 58, 0.3);
}

.check-fill {
  box-shadow: 0 0.1vw 0.25vw rgba(64, 158, 255, 0.3);
}

.file-card:hover .progress-text {
  opacity: 1;
}
</style>