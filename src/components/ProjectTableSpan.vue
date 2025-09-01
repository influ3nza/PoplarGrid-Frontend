<template>
  <div class="project-detail-container">
    <div class="project-content">
      <div class="project-layout">
        <!-- 项目图片 -->
        <div class="project-image-container">
          <el-image
            class="project-image"
            :key="project.id"
            :src="projectStore.project_file_page[0]?.fullUrl"
            fit="contain"
            lazy
          >
            <template #error>
              <el-skeleton-item
                variant="image"
                style="width: 100%; height: 100%"
              />
            </template>
          </el-image>
        </div>

        <!-- 项目信息 -->
        <div class="project-info">
          <!-- 项目成员信息 -->
          <div class="project-members">
            <el-descriptions class="members-description" :column="2" border>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><Aim /></el-icon>
                    图源
                  </div>
                </template>
                {{
                  project.labors.find((item) => item.laborRole === 0)
                    ?.nickname || "暂无"
                }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><MagicStick /></el-icon>
                    美工
                  </div>
                </template>
                {{
                  project.labors.find((item) => item.laborRole === 4)
                    ?.nickname || "暂无"
                }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><EditPen /></el-icon>
                    翻译
                  </div>
                </template>
                {{
                  project.labors.find((item) => item.laborRole === 1)
                    ?.nickname || "暂无"
                }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><DocumentChecked /></el-icon>
                    校对
                  </div>
                </template>
                {{
                  project.labors.find((item) => item.laborRole === 2)
                    ?.nickname || "暂无"
                }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><Stamp /></el-icon>
                    嵌字
                  </div>
                </template>
                {{
                  project.labors.find((item) => item.laborRole === 3)
                    ?.nickname || "暂无"
                }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><CircleCheck /></el-icon>
                    审核
                  </div>
                </template>
                {{
                  project.labors.find((item) => item.laborRole === 5)
                    ?.nickname || "暂无"
                }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 项目时间信息 -->
          <div class="project-time">
            <el-descriptions class="time-description" :column="1" border>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><Flag /></el-icon>
                    创建时间
                  </div>
                </template>
                {{ project.createdAt || "暂无" }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><Edit /></el-icon>
                    最后更新时间
                  </div>
                </template>
                {{ project.updatedAt || "暂无" }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 项目进度 -->
          <div class="project-progress">
            <div class="progress-item">
              <span class="progress-label">翻译进度</span>
              <el-progress
                :text-inside="true"
                :stroke-width="26"
                :percentage="70"
                status="warning"
              />
            </div>
            <div class="progress-item">
              <span class="progress-label">校对进度</span>
              <el-progress
                :text-inside="true"
                :stroke-width="26"
                :percentage="70"
                status="exception"
              />
            </div>
          </div>

          <!-- 备注 -->
          <div class="project-notes">
            <span
              >这是项目备注占位内容，标签的长度，例如'50px'。作为Form直接子元素的form-item会继承该值。可以使用auto。When
              you use ==, it performs a comparison but doesn't assign the value.
              The comparison returns true.
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Aim,
  MagicStick,
  EditPen,
  DocumentChecked,
  Stamp,
  CircleCheck,
} from "@element-plus/icons-vue";
import type { ProjectDetail } from "@/types";
import { onMounted } from "vue";
import { useProjectsStore } from "@/stores/projects";

const projectStore = useProjectsStore();

interface Props {
  project: ProjectDetail;
  color_theme: string;
}

const props = defineProps<Props>();

onMounted(async () => {
  // TODO by influ3nza:
  // 获取项目的封面图
  await projectStore.fetchProjectFiles(props.project.id);
});
</script>

<style scoped>
.project-detail-container {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  transform: translateY(-10px);
  opacity: 0;
  animation: expandIn 0.3s ease-out forwards;
  display: flex;
  justify-content: center;
  align-items: center;
}

@keyframes expandIn {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.project-content {
  width: 90%;
  background-color: rgba(from var(--project-theme-color) r g b / 0.2);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.project-image-container {
  flex: 0 0 auto;
  width: 400px;
  height: 568px;
}

.project-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.project-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2vh;
  height: 568px;
}

.project-members {
  flex: 0 0 auto;
}

.members-description {
  width: 100%;
}

.project-time {
  flex: 0 0 auto;
}

.time-description {
  width: 100%;
}

.project-progress {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  justify-content: center;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.project-notes {
  flex: 1;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  justify-content: center;
  height: 100%;
}

.cell-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

/* 平板设备响应式 */
@media (max-width: 1024px) {
  .project-detail-container {
    padding: 16px;
  }

  .project-content {
    padding: 20px;
  }

  .project-layout {
    gap: 24px;
  }

  .project-image-container {
    min-width: 250px;
    max-width: 300px;
  }

  .project-image {
    height: 400px;
  }

  .project-info {
    min-height: 400px;
  }
}

/* 手机设备响应式 */
@media (max-width: 768px) {
  .project-detail-container {
    padding: 12px;
  }

  .project-content {
    padding: 16px;
  }

  .project-layout {
    flex-direction: column;
    gap: 20px;
  }

  .project-image-container {
    min-width: 100%;
    max-width: 100%;
    align-self: center;
  }

  .project-image {
    height: 300px;
    max-width: 400px;
    margin: 0 auto;
  }

  .project-info {
    min-height: auto;
    gap: 20px;
  }

  .members-description {
    --el-descriptions-item-bordered-label-background: #fafafa;
  }

  .members-description :deep(.el-descriptions__body) {
    --el-descriptions-table-border: 1px solid #e4e7ed;
  }
}

/* 小屏幕手机设备响应式 */
@media (max-width: 480px) {
  .project-detail-container {
    padding: 8px;
  }

  .project-content {
    padding: 12px;
  }

  .project-layout {
    gap: 16px;
  }

  .project-image {
    height: 250px;
  }

  .project-info {
    gap: 16px;
  }

  .project-progress {
    padding: 16px;
  }

  .progress-item {
    gap: 6px;
  }

  .progress-label {
    font-size: 13px;
  }

  /* 在小屏幕上将描述列表改为单列 */
  .members-description {
    --el-descriptions-column: 1;
  }

  .members-description :deep(.el-descriptions__body .el-descriptions__table) {
    table-layout: fixed;
  }

  .members-description :deep(.el-descriptions__label) {
    width: 35%;
  }

  .members-description :deep(.el-descriptions__content) {
    width: 65%;
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .project-image {
    height: 200px;
  }

  .cell-item {
    font-size: 12px;
  }

  .progress-label {
    font-size: 12px;
  }
}
</style>
