<template>
  <div style="display: flex; justify-content: flex-end; align-items: center">
    <div class="progress-container">
      <div
        v-for="(label, index) in status_fields_short"
        :key="label"
        class="progress-item"
      >
        <span class="progress-label">{{ label }}</span>
        <component
          :is="getProgressIcon(status, index).icon"
          class="progress-icon"
          :class="getProgressIcon(status, index).class"
        />
      </div>
      <div class="progress-item">
        <span class="progress-label pub-label">发布</span>
        <component
          :is="
            pub_options.find(
              (item) => item.value === Number(is_published)
            )?.icon
          "
          class="progress-icon"
          :class="
            pub_options.find(
              (item) => item.value === Number(is_published)
            )?.class
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { pub_options, status_fields_short } from '@/utils/static';
import { CloseBold, MoreFilled, Select } from '@element-plus/icons-vue';

interface Props {
  status: number; // 0-未开始，1-翻译中，2-待校对，3-已完成
  is_published: boolean; // 是否发布
}

const props = defineProps<Props>();

const getProgressIcon = (status: number, index: number) => {
  const trit = status.toString(3).padStart(4, "0")[index];

  if (trit === "2") return { icon: Select, class: "text-green-500" };
  if (trit === "1") return { icon: MoreFilled, class: "text-yellow-500" };
  return { icon: CloseBold, class: "text-gray-500" };
};
</script>

<style scoped>
.progress-container {
  display: flex;
  justify-content: right;
  align-items: center;
  gap: 16px;
  padding: 8px;
  min-width: 24vw;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 0.5vw;
}

.progress-label {
  font-size: 18px;
  font-weight: 500;
  color: #6b7280;
}

.dark .progress-label {
  color: #9ca3af;
}

.pub-label {
  font-weight: 600;
  color: var(--project-theme-color);
}

.progress-icon {
  width: 16px;
  height: 16px;
}
</style>
