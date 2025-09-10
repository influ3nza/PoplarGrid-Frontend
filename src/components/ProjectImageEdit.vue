<template>
  <div class="project-image-edit">
    <div class="panel-header">
      <div class="header-content">
        <el-icon class="export-icon">
          <Download />
        </el-icon>
        <span class="panel-title">导出文件</span>
      </div>
      <el-tag
        :type="selected_files.length === 0 ? 'primary' : 'success'"
        effect="light"
        size="large"
        class="file-count"
      >
        {{
          selected_files.length === 0
            ? "全部" + total_files + "页"
            : "已选择" + selected_files.length + "页"
        }}
      </el-tag>
    </div>

    <div class="export-section">
      <div class="export-section-title">选择操作</div>
      <div class="export-operation">
        <el-button type="primary" :icon="Select" size="default" @click="">
          全选
        </el-button>
        <el-button type="warning" :icon="Switch" size="default" @click="">
          反选
        </el-button>
        <el-button type="danger" :icon="Delete" size="default" @click="">
          清空
        </el-button>
      </div>
    </div>

    <div class="export-section">
      <div class="export-section-title">导出选项</div>
      <div class="export-option">
        <el-button type="primary" :icon="PictureFilled" size="large" @click="">
          图片 + 翻译
        </el-button>
        <el-button type="success" :icon="DocumentCopy" size="large" @click="">
          仅翻译
        </el-button>
      </div>
    </div>

    <div class="export-section">
      <div class="export-section-title">导出历史</div>
      <div
        v-for="record in projectStore.project_output_history"
        :key="record.createdTime"
      >
        <el-card>
          <el-image :src="record.user.avatar" fit="cover" />
          <span>{{ record.user.nickname }}</span>
          <span>{{ record.createdTime }}</span>
          <!-- TODO by influ3nza: mock output history -->
        </el-card>
      </div>
      <div v-if="projectStore.project_output_history.length === 0">
        <el-empty
          description="暂无导出记录"
          :image-size="50"
          style="padding: 5px"
        />
      </div>
    </div>

    <div class="panel-header">
      <div class="header-content">
        <el-icon class="export-icon">
          <Upload />
        </el-icon>
        <span class="panel-title">上传文件</span>
      </div>
      <el-button> 上传 </el-button>
    </div>

    <div class="panel-header">
      <div class="header-content">
        <el-icon class="export-icon">
          <Search />
        </el-icon>
        <span class="panel-title">译文搜索/替换</span>
      </div>
      <el-switch
        active-text="修改校对"
        inactive-text="修改翻译"
        v-model="proofread_mode"
      />
    </div>

    <div class="search-section">
      <div class="search-input-group">
        <el-input
          v-model="search_text"
          class="search-input"
          placeholder="输入要查找的内容"
          clearable
          @keyup.enter="handleTranslationSearch"
        >
        </el-input>
        <el-button
          type="primary"
          class="search-btn"
          :loading="translation_search_loading"
          @click="handleTranslationSearch"
        >
          搜索
        </el-button>
      </div>

      <div class="replace-input-group">
        <el-input
          v-model="replace_text"
          class="replace-input"
          :placeholder="proofread_mode ? '替换为校对' : '替换为翻译'"
          clearable
          @keyup.enter="handleReplaceAll"
        >
        </el-input>
        <el-button
          type="warning"
          class="replace-btn"
          :disabled="!search_text || translation_search_result.length === 0"
          @click="replace_dialog_visible = true"
        >
          全部替换
        </el-button>
      </div>
    </div>

    <!-- 搜索结果区域 -->
    <div class="search-results-section" v-if="search_text">
      <div class="results-header">
        <span class="results-title">搜索结果</span>
        <span class="results-count" v-if="!translation_search_loading">
          共找到 {{ translation_search_result.length }} 条结果
        </span>
      </div>

      <div v-if="translation_search_loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>

      <div
        v-else-if="translation_search_result.length > 0"
        class="results-list"
      >
        <div
          v-for="(res, index) in translation_search_result"
          :key="`${res.pageIndex}-${res.sourceIndex}`"
          class="result-item"
        >
          <el-card class="result-card" shadow="hover">
            <div class="result-header">
              <div class="result-location">
                <el-tag type="info" size="small" effect="plain">
                  第{{ res.pageIndex }}页
                </el-tag>
                <el-tag type="info" size="small" effect="plain">
                  第{{ res.sourceIndex }}框
                </el-tag>
                <el-tag
                  type="info"
                  :color="
                    res.sourceType ? 'rgb(255, 150, 156)' : 'rgb(255, 213, 131)'
                  "
                  size="small"
                  effect="plain"
                >
                  {{ res.sourceType === 0 ? "翻译" : "校对" }}
                </el-tag>
              </div>
              <div>
                <el-button type="primary" size="small"> 查看 </el-button>
                <el-button
                  type="warning"
                  size="small"
                  plain
                  @click="handleSingleReplace(index)"
                >
                  替换此项
                </el-button>
              </div>
            </div>

            <div class="result-content">
              <div
                class="highlighted-text"
                v-html="
                  highlightText(res.targetText, search_text, replace_text)
                "
              ></div>
            </div>
          </el-card>
        </div>
      </div>

      <div v-else class="no-results">
        <el-empty description="未找到匹配的内容" :image-size="80">
          <template #image>
            <el-icon class="empty-icon">
              <Search />
            </el-icon>
          </template>
        </el-empty>
      </div>
    </div>
  </div>
  <el-dialog
    v-model="replace_dialog_visible"
    title="提示"
    width="500"
    show-close="false"
  >
    <span>是否确认替换全部{{ translation_search_result.length }}条文本？</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="replace_dialog_visible = false">取消</el-button>
        <el-button type="primary" @click="handleReplaceAll">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useProjectsStore } from "@/stores/projects";
import { TranslationSearchResult } from "@/types";
import {
  Delete,
  DocumentCopy,
  PictureFilled,
  Select,
  Switch,
  Search,
  EditPen,
  Upload,
  Download,
} from "@element-plus/icons-vue";
import { ref } from "vue";

interface Props {
  selected_files: number[]; // 已选择的文件页码
  total_files: number; // 总文件页码
}

defineProps<Props>();
const projectStore = useProjectsStore();

// 译文查找替换
const proofread_mode = ref<boolean>(false);
const search_text = ref<string>("");
const replace_text = ref<string>("");
const translation_search_result = ref<TranslationSearchResult[]>([]);
const translation_search_loading = ref<boolean>(false);

// 确认框
const replace_dialog_visible = ref<boolean>(false);

// 高亮显示匹配文本
const highlightText = (
  text: string,
  searchText: string,
  replaceText: string
): string => {
  if (!searchText) return text;

  const regex = new RegExp(
    searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "gi"
  );

  if (!replaceText) {
    // 如果没有替换文本，只用黄色高亮
    return text.replace(regex, '<span class="highlight-search">$&</span>');
  } else {
    // 如果有替换文本，用红色高亮原文并添加删除线，然后添加绿色高亮的替换文本
    return text.replace(
      regex,
      '<span class="highlight-original">$&</span><span class="highlight-replace">' +
        replaceText +
        "</span>"
    );
  }
};

// 进行译文搜索
const handleTranslationSearch = () => {
  if (!search_text.value.trim()) return;

  translation_search_loading.value = true;
  translation_search_result.value = [];

  // 模拟搜索延迟
  setTimeout(() => {
    translation_search_loading.value = false;
    translation_search_result.value = [
      {
        pageIndex: 1,
        sourceIndex: 1,
        sourceType: 0,
        targetText: "这是一个测试文本，包含了测试内容和其他信息。",
      },
      {
        pageIndex: 2,
        sourceIndex: 3,
        sourceType: 0,
        targetText: "另一个测试示例，用于演示搜索功能的效果。",
      },
      {
        pageIndex: 3,
        sourceIndex: 2,
        sourceType: 0,
        targetText: "第三个包含测试关键词的文本段落。",
      },
    ];
  }, 1000);
};

// 单个替换
const handleSingleReplace = (index: number) => {
  const result = translation_search_result.value[index];
  const regex = new RegExp(
    search_text.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "gi"
  );
  result.targetText = result.targetText.replace(regex, replace_text.value);

  // 可以在这里添加保存逻辑
  console.log(`替换第${result.pageIndex}页第${result.sourceIndex}框的内容`);
};

// 全部替换
const handleReplaceAll = () => {
  replace_dialog_visible.value = false;

  const regex = new RegExp(
    search_text.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "gi"
  );

  translation_search_result.value.forEach((result) => {
    result.targetText = result.targetText.replace(regex, replace_text.value);
  });
};
</script>

<style scoped>
.project-image-edit {
  overflow-y: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  padding-top: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .export-icon {
    font-size: 20px;
    color: var(--el-color-primary);
  }

  .panel-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .file-count {
    font-weight: 600;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 16px;
  }
}

.export-section {
  padding-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.export-section-title {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  margin-bottom: 12px;
}

.export-operation {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .el-button {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;
  }
}

.export-option {
  display: flex;
  gap: 12px;

  .el-button {
    border-radius: 8px;
    font-weight: 600;
    height: 44px;
    transition: all 0.2s ease;
  }
}

/* 搜索替换区域样式 */
.search-section {
  padding: 16px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.search-input-group,
.replace-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.replace-input-group {
  margin-bottom: 0;
}

.search-input,
.replace-input {
  flex: 1;
}

.search-btn,
.replace-btn {
  min-width: 80px;
  border-radius: 8px;
  font-weight: 500;
}

.search-icon,
.replace-icon {
  color: var(--el-color-info);
}

/* 搜索结果区域样式 */
.search-results-section {
  padding-top: 16px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.results-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.results-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  padding: 4px 8px;
  border-radius: 12px;
}

.loading-container {
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  transition: transform 0.2s ease;
}

.result-item:hover {
  transform: translateY(-2px);
}

.result-card {
  border-radius: 12px;
  overflow: hidden;
}

.result-card :deep(.el-card__body) {
  padding: 16px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-location {
  display: flex;
  gap: 8px;
}

.result-content {
  background: var(--el-fill-color-extra-light);
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid var(--el-color-primary);
}

.highlighted-text {
  line-height: 1.6;
  font-size: 14px;
  word-break: break-word;
}

/* 高亮样式 */
.highlighted-text :deep(.highlight-search) {
  background-color: #fff3cd;
  color: #856404;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 500;
}

.highlighted-text :deep(.highlight-original) {
  background-color: #f8d7da;
  color: #721c24;
  padding: 2px 4px;
  border-radius: 4px;
  text-decoration: line-through;
  font-weight: 500;
  margin-right: 4px;
}

.highlighted-text :deep(.highlight-replace) {
  background-color: #d1e7dd;
  color: #0f5132;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 500;
}

.no-results {
  padding: 32px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--el-color-info);
  opacity: 0.6;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .search-input-group,
  .replace-input-group {
    flex-direction: column;
    align-items: stretch;
  }

  .search-btn,
  .replace-btn {
    min-width: auto;
  }

  .result-header {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .result-location {
    justify-content: center;
  }
}
</style>
