<template>
  <div class="preview-header">
    <div
      style="display: flex; align-items: center; width: 100%"
      :style="{
        'justify-content':
          focus_file !== null && !file_edit_mode ? 'space-between' : 'right',
      }"
    >
      <div v-if="focus_file !== null && !file_edit_mode" class="image-count">
        图片
        {{ 1 + focus_file + page_size * (current_page - 1) }} /
        {{ total_files }}
      </div>
      <el-switch
        :model-value="file_edit_mode"
        :active-text="
          user_status === 1 ? '编辑/导出/上传' : '非本项目成员不得操作'
        "
        inactive-text="浏览模式"
        @change="handleFileEditModeChange"
        :disabled="user_status !== 1"
      />
    </div>
    <el-button
      v-if="focus_file !== null && !file_edit_mode"
      style="width: 100%"
      type="primary"
      @click="startTranslation"
      :disabled="user_status !== 1"
      >{{ user_status === 1 ? "从此页开始汉化" : "非本项目成员不得操作" }}
    </el-button>
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
  page_size: number;
  current_page: number;
}

const props = defineProps<Props>();
const projectStore = useProjectsStore();

const emit = defineEmits<{
  "update:file_edit_mode": [value: boolean];
}>();

// 开始翻译功能
const startTranslation = () => {
  router.push(
    `/translator/${projectStore.project_detail?.moetranId}/${
      projectStore.project_file_page[props.focus_file!].id
    }`
  );
};

// 传递改变信号
const handleFileEditModeChange = (value: boolean) => {
  emit("update:file_edit_mode", value);
};
</script>

<style scoped>
.preview-header {
  padding-bottom: 12px;
}
</style>