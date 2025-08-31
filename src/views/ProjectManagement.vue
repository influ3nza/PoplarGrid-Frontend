<template>
  <div class="layout-container">
    <!-- 筛选器 -->
    <div
      class="filter-container bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <!-- 操作按钮 -->
      <div class="action-section mb-6">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <div class="action-switch">
            <span
              :class="{ active: !my_filter }"
              class="action-left"
              :style="{ color: !my_filter ? color_theme_1 : '' }"
              @click="switchMyFilter"
            >
              所有项目
            </span>
            <el-switch
              v-model="my_filter"
              @change="handleMyFilterChange"
              size="large"
              :style="{
                '--el-switch-on-color': color_theme_2,
                '--el-switch-off-color': color_theme_1,
              }"
            />
            <span
              :class="{ active: my_filter }"
              class="action-right"
              :style="{ color: my_filter ? color_theme_2 : '' }"
              @click="switchMyFilter"
            >
              我的项目
            </span>
          </div>
          <div class="action-buttons">
            <el-button
              size="large"
              @click="handleFilterReset"
              class="reset-btn"
            >
              <el-icon><RefreshLeft /></el-icon>
              &nbsp; 重置筛选
            </el-button>
            <el-button
              type="primary"
              size="large"
              @click="handleCombinedSearch"
              class="search-btn"
            >
              <el-icon><Search /></el-icon>
              &nbsp; 搜索
            </el-button>
          </div>
        </div>
      </div>

      <!-- 顶部搜索栏 -->
      <div class="search-section mb-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="filter-item flex-1">
            <label class="filter-label">项目名称或编号</label>
            <el-input
              v-model="title_filter"
              placeholder="搜索项目名称或编号"
              :prefix-icon="Search"
              class="search-input"
              clearable
              size="large"
            />
          </div>
          <transition name="my-filter">
            <div class="filter-item" v-if="!my_filter">
              <label class="filter-label">参与人员</label>
              <el-select
                v-model="participant_filter"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="查找参与人员"
                :remote-method="handleParticipantFilterChange"
                :loading="participant_filter_loading"
                class="filter-select"
                size="large"
              >
                <el-option
                  v-for="item in participant_filter_options"
                  :key="item.id"
                  :value="item"
                  class="filter-select-option"
                >
                  <div class="participant-option-display">
                    <div class="flex items-center">
                      <el-image
                        class="h-[8vh] w-[8vh] rounded-full"
                        :src="item.avatar"
                        fit="cover"
                      />
                    </div>
                    <div class="flex items-center font-semibold text-sm">
                      <span>{{ item.nickname }}</span>
                    </div>
                  </div>
                </el-option>
                <template #label>
                  <div class="flex items-center font-semibold text-sm">
                    <span>{{ participant_filter?.nickname }}</span>
                  </div>
                </template>
              </el-select>
            </div>
          </transition>
          <div class="filter-item">
            <label class="filter-label">所属项目集</label>
            <el-select
              v-model="workset_filter"
              placeholder="选择项目集"
              class="filter-select"
              size="large"
            >
              <el-option label="全部类型" :value="null" />
              <el-option
                v-for="tag in all_worksets"
                :key="tag.id"
                :label="tag.label"
                :value="tag.id"
              />
            </el-select>
          </div>
          <div class="filter-item">
            <label class="filter-label">排序方式</label>
            <el-select
              v-model="order_mode_filter"
              placeholder="选择排序方式"
              class="filter-select"
              size="large"
            >
              <template #label>
                <span>{{ order_options[order_mode_filter].label }}</span>
              </template>
              <el-option
                v-for="option in order_options"
                :key="option.label"
                :value="option.value"
              >
                {{ option.label }}
              </el-option>
            </el-select>
          </div>
        </div>
      </div>

      <!-- 分管状态筛选 -->
      <div class="status-section">
        <div
          class="flex items-center gap-4 flex-wrap"
          style="justify-content: space-between"
        >
          <div
            v-for="(field, index) in status_fields"
            :key="field"
            class="filter-item"
          >
            <label class="filter-label">{{ field }}</label>
            <el-select
              :key="field"
              v-model="project_status_filter[index]"
              :placeholder="'选择' + field + '状态'"
              @change="handleStatusFilterChange"
              :disabled="status_filter_disable[index]"
              class="filter-select"
              size="large"
            >
              <!-- 自定义选中项显示 -->
              <template #label>
                <div class="status-option-display">
                  <component
                    :is="
                      status_options.find(
                        (item) => item.value == project_status_filter[index]
                      )?.icon
                    "
                    :class="
                      status_options.find(
                        (item) => item.value == project_status_filter[index]
                      )?.class
                    "
                  />
                  <span>{{
                    status_options.find(
                      (item) => item.value == project_status_filter[index]
                    )?.description
                  }}</span>
                </div>
              </template>

              <el-option
                v-for="option in status_options"
                :key="field + option.description"
                :value="option.value"
              >
                <div class="status-option">
                  <component :is="option.icon" :class="option.class" />
                  <span>{{ option.description }}</span>
                </div>
              </el-option>
            </el-select>
          </div>
          <div class="filter-item">
            <label class="filter-label">发布状态</label>
            <el-select
              v-model="pub_status_filter"
              placeholder="选择发布状态"
              class="filter-select"
              size="large"
              @change="handleStatusFilterChange"
            >
              <template #label>
                <span>{{
                  pub_options.find((item) => item.value === pub_status_filter)
                    ?.label
                }}</span>
              </template>
              <el-option
                v-for="option in pub_options"
                :key="option.label"
                :value="option.value"
                :label="option.label"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目表格 -->
    <div
      class="table-container bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      v-loading="projectStore.projects_page_loading"
    >
      <!-- 表格标题栏 -->
      <div class="table-header">
        <div class="header-content">
          <div class="header-left">
            <h2 class="table-title">筛选结果</h2>
            <div class="result-count">
              ({{ (current_page - 1) * page_size + 1 }} -
              {{ current_page * page_size }}, 共 {{ total_projects }} 个)
            </div>
          </div>
          <div class="header-right">
            <el-pagination
              :page-size="15"
              :pager-count="5"
              layout="prev, pager, next"
              :current-page="current_page"
              @current-change="handleCurrentPageChange"
              :total="total_projects"
              class="header-pagination"
              size="large"
            />
          </div>
        </div>
      </div>

      <!-- 表格内容 -->
      <div class="table-content">
        <div class="overflow-x-auto">
          <el-table
            :data="projectStore.projects_page"
            class="project-table"
            show-header="false"
            table-layout="fix"
            @expand-change="handleExpandChange"
            :expand-row-keys="expand_row_keys"
            row-key="id"
          >
            <!-- 将整个表格行作为一列，便于管理样式 -->
            <el-table-column align="center">
              <template #default="scope">
                <div style="display: flex; justify-content: space-between">
                  <div
                    style="
                      display: flex;
                      justify-content: flex-start;
                      align-items: center;
                    "
                  >
                    <!-- 项目编号与项目集 -->
                    <div class="project-type mr-2">
                      <el-tag effect="dark" class="type-tag" size="large">
                        {{ all_worksets[scope.row.worksetId].label }} -
                        {{ scope.row.worksetIndex }}
                      </el-tag>
                    </div>
                    <!-- 项目名 -->
                    <div class="project-name">
                      <el-link
                        @click="navigateToProject(scope.row)"
                        :underline="false"
                        class="project-link"
                      >
                        {{ scope.row.title }}
                      </el-link>
                    </div>
                  </div>
                  <div
                    style="
                      display: flex;
                      justify-content: flex-end;
                      align-items: center;
                    "
                  >
                    <div class="progress-container">
                      <div
                        v-for="(label, index) in status_fields_short"
                        :key="label"
                        class="progress-item"
                      >
                        <span class="progress-label">{{ label }}</span>
                        <component
                          :is="getProgressIcon(scope.row.status, index).icon"
                          class="progress-icon"
                          :class="
                            getProgressIcon(scope.row.status, index).class
                          "
                        />
                      </div>
                      <div class="progress-item">
                        <span class="progress-label pub-label">发布</span>
                        <component
                          :is="
                            pub_options.find(
                              (item) =>
                                item.value === Number(scope.row.isPublished)
                            )?.icon
                          "
                          class="progress-icon"
                          :class="
                            pub_options.find(
                              (item) =>
                                item.value === Number(scope.row.isPublished)
                            )?.class
                          "
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 展开按钮 -->
            <el-table-column type="expand" width="50">
              <template #default="scope">
                <div
                  v-if="detailed_project_loading"
                  class="project-detail-loading"
                >
                  <el-skeleton :rows="5" animated />
                </div>
                <ProjectTableSpan
                  v-else
                  :project="detailed_project_page.find(item => item.id === scope.row.id)!"
                  :color_theme="my_filter ? color_theme_2 : color_theme_1"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div class="table-header table-footer">
        <div class="header-right">
          <el-pagination
            :page-size="15"
            :pager-count="5"
            layout="prev, pager, next"
            :current-page="current_page"
            @current-change="handleCurrentPageChange"
            :total="total_projects"
            class="header-pagination"
            size="large"
          />
        </div>
      </div>

      <!-- 底部分页（移动端显示） -->
      <div class="bottom-pagination">
        <el-pagination
          :page-size="15"
          :pager-count="5"
          layout="prev, pager, next"
          :current-page="current_page"
          @current-change="handleCurrentPageChange"
          :total="total_projects"
          size="default"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  CloseBold,
  Select,
  MoreFilled,
  Search,
  Star,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useSyncStore } from "@/stores/sync";
import { useAuthStore } from "@/stores/auth";
import ProjectTableSpan from "@/components/ProjectTableSpan.vue";
import { membersApi } from "@/api/members";
import { ProjectBasic, ProjectDetail, User } from "@/types";
import { useProjectsStore } from "@/stores/projects";
import { title } from "process";
import HelloWorld from "@/components/HelloWorld.vue";

const router = useRouter();
const syncStore = useSyncStore();
const authStore = useAuthStore();
const projectStore = useProjectsStore();

const hello = ref<any>(null);

const expand_row_keys = ref<any[]>([]); // 保证表格同一时间只有一行被展开

// 筛选器相关
const my_filter = ref<boolean>(false); // 是否只显示本用户的项目

const project_status_filter = ref<number[]>([3, 3, 3, 3]); // 项目分管阶段
const status_filter_disable = ref<boolean[]>([false, false, false, false]); // 项目分管阶段筛选器是否可操作

const pub_status_filter = ref<number>(2); // 发布状况
const order_mode_filter = ref<number>(0); // 显示排序方式
const participant_filter = ref<User | null>(null); // 参与人员
// TODO by influ3nza:
// 这个之后移动到UserStore里
const participant_filter_loading = ref<boolean>(false); // 参与人员搜索加载状态
const participant_filter_options = ref<User[]>([]); // 传回参与人员筛选器的结果

const title_filter = ref<string>(""); // 项目标题筛选
const workset_filter = ref<number | null>(null); // 项目集筛选

const status_fields = ["翻译", "校对", "嵌字", "审核"];
const status_fields_short = ["翻", "校", "嵌", "审"];
const status_options = [
  {
    icon: Star,
    class: "text-blue-500 w-4 h-4",
    description: "全部状态",
    value: 3,
  },
  {
    icon: CloseBold,
    class: "text-gray-500 w-4 h-4",
    description: "未开始",
    value: 0,
  },
  {
    icon: MoreFilled,
    class: "text-yellow-500 w-4 h-4",
    description: "进行中",
    value: 1,
  },
  {
    icon: Select,
    class: "text-green-500 w-4 h-4",
    description: "已完成",
    value: 2,
  },
];
const order_options = [
  {
    label: "更新时间由新到旧",
    value: 0,
  },
  {
    label: "更新时间由旧到新",
    value: 1,
  },
  {
    label: "项目编号由小到大",
    value: 2,
  },
  {
    label: "项目编号由大到小",
    value: 3,
  },
];
const pub_options = [
  {
    label: "全部状态",
    value: 2,
    icon: Star,
    class: "text-blue-500 w-4 h-4",
  },
  {
    label: "未发布",
    value: 0,
    icon: CloseBold,
    class: "text-gray-500 w-4 h-4",
  },
  {
    label: "已发布",
    value: 1,
    icon: Select,
    class: "text-green-500 w-4 h-4",
  },
];

// 分页相关
const current_page = ref<number>(1);
const page_size = 15;

// 项目集相关
const all_worksets = [
  {
    id: 1,
    label: "未分类",
  },
  {
    id: 2,
    label: "工作集1",
  },
  {
    id: 3,
    label: "工作集2",
  },
  {
    id: 4,
    label: "工作集3",
  },
]; // 项目集列表

// 总项目数
const total_projects = ref<number>(1024);
const detailed_project_page = ref<ProjectDetail[]>([]); // 详细的项目缓存
const detailed_project_loading = ref<boolean>(false); // 详细项目是否在加载，这里无法使用store中的对应变量

// 颜色主题
const color_theme_1 = ref<string>("");
const color_theme_2 = ref<string>("");

const getProgressIcon = (status: number, index: number) => {
  const trit = status.toString(3).padStart(4, "0")[index];

  if (trit === "2") return { icon: Select, class: "text-green-500" };
  if (trit === "1") return { icon: MoreFilled, class: "text-yellow-500" };
  return { icon: CloseBold, class: "text-gray-500" };
};

const navigateToProject = (project: any) => {
  // 跳转到项目详情页
  router.push(`/projects/${project.id}`);
};

const switchMyFilter = () => {
  my_filter.value = !my_filter.value;
  handleMyFilterChange(my_filter.value);
};

const handleMyFilterChange = async (value: boolean) => {
  // 清空所有筛选条件
  handleFilterReset();

  if (value === true) {
    // TODO by influ3nza:
    // 按照本用户搜索项目
    await projectStore.fetchProjects();

    // TODO by influ3nza:
    // 在每一次取项目页的时候，清空本地详细项目缓存，且将展开行清空
    detailed_project_page.value = [];
  } else {
    // TODO by influ3nza:
    // 搜索全部项目
    await projectStore.fetchProjects();

    detailed_project_page.value = [];
  }

  updateGlobalThemeColor();
  expand_row_keys.value = []; // 清空展开行
  current_page.value = 1; // 重置到第一页
};

const handleExpandChange = async (row: any, expandedRows: any[]) => {
  // 保证表格在同一时刻是有一行为展开状态
  expand_row_keys.value = expandedRows.length > 0 ? [row.id] : [];

  // 检查这一行是否已经缓存过
  if (detailed_project_page.value.some((p) => p.id === row.id)) {
    // 如果已经缓存过，则不需要重新请求
    return;
  } else {
    // 如果没有缓存过，则请求项目详情
    detailed_project_loading.value = true;
    await projectStore.fetchProject(row.id);
    detailed_project_page.value.push(projectStore.project_detail!);
    detailed_project_loading.value = false;
  }
};

const handleCurrentPageChange = async (page: number) => {
  // 处理表格分页显示
  current_page.value = page;
  expand_row_keys.value = [];

  // TODO by influ3nza:
  // query backend w/ page_serial, page_size, sort, status, tag_id g/ project[]
  await projectStore.fetchProjects();

  detailed_project_page.value = [];
};

const handleParticipantFilterChange = async (query: string) => {
  // 每当成员筛选器的值发生变化，则请求一次符合的成员
  if (query) {
    participant_filter_loading.value = true;

    try {
      // TODO by influ3nza:
      // 根据字符串查询所有成员
      const users = await membersApi.searchUsers(query);
      participant_filter_options.value = users;
    } catch (error) {
      console.error("搜索失败:", error);
      // 可以在这里设置错误状态或显示错误信息
    } finally {
      participant_filter_loading.value = false;
    }
  } else {
    participant_filter_options.value = [];
  }
};

const handleStatusFilterChange = (_: any) => {
  const last_index = project_status_filter.value.lastIndexOf(2);
  const old_filter_disable = [...status_filter_disable.value];

  for (let j = 0; j < 4; j++) {
    status_filter_disable.value[j] = false;
  }

  if (last_index !== -1) {
    for (let j = 0; j < last_index; j++) {
      project_status_filter.value[j] = 2;
      status_filter_disable.value[j] = true;
    }
  }

  // 检查发布状态筛选
  if (pub_status_filter.value === 1) {
    for (let j = 0; j < 4; j++) {
      status_filter_disable.value[j] = true;
      project_status_filter.value[j] = 2;
    }
  }

  // 取消禁用状态的筛选器，将清除选项
  for (let j = 0; j < 4; j++) {
    if (
      old_filter_disable[j] === true &&
      status_filter_disable.value[j] === false
    ) {
      for (let k = 0; k <= j; k++) {
        project_status_filter.value[k] = 3;
        status_filter_disable.value[k] = false;
      }
    }
  }
};

const handleFilterReset = () => {
  // 重置所有筛选器的值
  project_status_filter.value = [3, 3, 3, 3];
  status_filter_disable.value = [false, false, false, false];
  pub_status_filter.value = 2;
  order_mode_filter.value = 0;

  participant_filter.value = null;
  participant_filter_options.value = [];

  title_filter.value = "";
  workset_filter.value = null;
};

const handleCombinedSearch = async () => {
  // TODO by influ3nza:
  // 处理综合搜索逻辑
  current_page.value = 1; // 重置到第一页
  expand_row_keys.value = []; // 取消展开行

  await projectStore.fetchProjects();

  detailed_project_page.value = [];
};

const updateGlobalThemeColor = () => {
  if (my_filter.value) {
    document.documentElement.style.setProperty(
      "--project-theme-color",
      color_theme_2.value
    );
  } else {
    document.documentElement.style.setProperty(
      "--project-theme-color",
      color_theme_1.value
    );
  }
};

onMounted(async () => {
  await Promise.all([
    projectStore.fetchProjects(),

    // TODO by influ3nza:
    // 请求项目集信息
  ]);

  // 获取颜色主题
  color_theme_1.value = localStorage.getItem("color-theme-1") || "#3b82f6";
  color_theme_2.value = localStorage.getItem("color-theme-2") || "#fa5555";
  updateGlobalThemeColor();

  // TODO by influ3nza:
  // 请求总项目数量
  // query backend w/ - g/ number
});
</script>

<style scoped>
.layout-container {
  width: 90%;
  margin: auto;
  padding-top: 30px;
  padding-bottom: 30px;
}

/* 表格样式 */
.table-container {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.table-container:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.dark .table-container {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-color: #475569;
}

.table-header {
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #e2e8f0;
  backdrop-filter: blur(10px);
}

.table-footer {
  display: flex;
  justify-content: flex-end;
}

.dark .table-header {
  background: rgba(30, 41, 59, 0.8);
  border-color: #475569;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.dark .table-title {
  color: #f9fafb;
}

.result-count {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.dark .result-count {
  color: #9ca3af;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-pagination {
  margin: 0;
}

.table-content {
  padding: 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0 0 12px 12px;
}

.dark .table-content {
  background: rgba(30, 41, 59, 0.9);
}

.project-table {
  width: 100%;
  background: transparent;
}

.dark .serial-number {
  color: #d1d5db;
}

.project-name {
  padding: 8px 12px;
  padding-left: 0;
  display: flex;
  text-align: left;
  justify-content: left;
}

.project-link {
  font-weight: 600;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.project-link:hover {
  color: var(--project-theme-color);
  transform: translateX(2px);
}

.dark .project-link {
  color: #60a5fa;
}

.dark .project-link:hover {
  color: #93c5fd;
}

.project-type {
  display: flex;
  justify-content: left;
  align-items: center;
  min-width: 10vw;
}

.type-tag {
  font-weight: 600;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 14px;
  background-color: var(--project-theme-color);
  border-color: var(--project-theme-color);
}

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

.project-detail-loading {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bottom-pagination {
  display: none;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0 0 12px 12px;
  border-top: 1px solid #e2e8f0;
  justify-content: center;
}

.dark .bottom-pagination {
  background: rgba(30, 41, 59, 0.8);
  border-color: #475569;
}

/* 表格 响应式设计 */
@media (max-width: 1250px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .header-left {
    width: 100%;
    justify-content: center;
  }

  .header-divider {
    display: none;
  }

  .header-right {
    display: none;
  }

  .bottom-pagination {
    display: flex;
  }

  .table-footer {
    display: none;
  }
}

@media (max-width: 1250px) {
  .table-container {
    margin: 0 -16px;
    border-radius: 0;
  }

  .table-header {
    padding: 16px;
    border-radius: 0;
  }

  .header-left {
    flex-direction: column;
    gap: 8px;
  }

  .table-title {
    font-size: 16px;
  }

  .result-count {
    font-size: 13px;
  }

  .progress-container {
    gap: 8px;
  }

  .progress-item {
    gap: 2px;
  }

  .progress-label {
    font-size: 11px;
  }

  .progress-icon {
    width: 14px;
    height: 14px;
  }

  .bottom-pagination {
    padding: 16px;
  }
}

@media (max-width: 1250px) {
  .progress-container {
    flex-direction: column;
    gap: 8px;
  }

  .progress-item {
    flex-direction: row;
    gap: 6px;
  }

  .project-name {
    padding: 4px 8px;
  }

  .project-link {
    font-size: 13px;
  }

  .type-tag,
  .status-tag {
    font-size: 12px;
    padding: 2px 6px;
  }
}

/* Element Plus 组件样式覆盖 */
:deep(.el-table) {
  background: transparent;
}

:deep(.el-table__body-wrapper) {
  background: transparent;
}

:deep(.el-table tr) {
  background: transparent;
  transition: all 0.2s ease;
}

:deep(.el-table tr:hover) {
  background: rgba(59, 130, 246, 0.05);
}

:deep(.dark .el-table tr:hover) {
  background: rgba(59, 130, 246, 0.1);
}

:deep(.el-table td) {
  border-bottom: 1px solid #f1f5f9;
  padding: 12px 8px;
}

:deep(.dark .el-table td) {
  border-color: #374151;
}

:deep(.el-table__expand-icon) {
  color: #6b7280;
  transition: all 0.2s ease;
}

:deep(.el-table__expand-icon:hover) {
  color: var(--project-theme-color);
  transform: scale(1.1);
}

:deep(.el-pagination) {
  padding: 0;
}

:deep(.el-pagination .el-pager li) {
  background: transparent;
  border: 1px solid #e2e8f0;
  margin: 0 2px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

:deep(.el-pagination .el-pager li:hover) {
  background: var(--project-theme-color);
  color: white;
  transform: translateY(-1px);
}

:deep(.el-pagination .el-pager li.is-active) {
  background: var(--project-theme-color);
  color: white;
  border-color: var(--project-theme-color);
}

:deep(.el-pagination .btn-prev) {
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin: 0 4px;
  transition: all 0.2s ease;
}

:deep(.el-pagination .btn-next) {
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin: 0 4px;
  transition: all 0.2s ease;
}

:deep(.el-pagination .btn-prev:hover) {
  background: var(--project-theme-color);
  color: white;
  transform: translateY(-1px);
}

:deep(.el-pagination .btn-next:hover) {
  background: var(--project-theme-color);
  color: white;
  transform: translateY(-1px);
}

:deep(.dark .el-pagination .el-pager li) {
  border-color: #475569;
  color: #d1d5db;
}

:deep(.dark .el-pagination .btn-prev, .dark .el-pagination .btn-next) {
  border-color: #475569;
  color: #d1d5db;
}

:deep(.el-tag__content) {
  font-size: 18px;
}

/* 展开样式 */
/* 单元格项目样式 */
.cell-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #374151;
}

.dark .cell-item {
  color: #d1d5db;
}

/* 描述列表样式优化 */
:deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: #f8fafc;
  --el-descriptions-item-bordered-content-background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: #374151;
  --el-descriptions-item-bordered-content-background: #1f2937;
}

/* 表格行悬停效果 */
:deep(.el-table__row) {
  transition: all 0.2s ease;
}

:deep(.el-table__row:hover) {
  background-color: #f8fafc !important;
}

.dark :deep(.el-table__row:hover) {
  background-color: #374151 !important;
}

/* 展开按钮样式 */
:deep(.el-table__expand-icon) {
  transition: transform 0.2s ease;
}

:deep(.el-table__expand-icon--expanded) {
  transform: rotate(90deg);
}

/* 展开 响应式 */
@media (max-width: 1250px) {
  .expand-inner {
    padding: 12px 16px;
    margin: 4px 0;
  }
}

/* 筛选器样式 */
.filter-container {
  background: rgba(from var(--project-theme-color) r g b / 0.3);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.dark .filter-container {
  background: #1e293b 0%;
  border-color: #475569;
}

.action-switch {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-switch span {
  font-size: 16px;
  font-weight: 500;
  color: #909399;
  transition: all 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.action-switch .action-left.active {
  font-weight: 600;
  text-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
}

.action-switch .action-right.active {
  font-weight: 600;
  text-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
}

.action-switch span:hover {
  color: var(--project-theme-color);
}

.search-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  backdrop-filter: blur(10px);
}

.dark .search-section {
  background: rgba(30, 41, 59, 0.7);
  border-color: #475569;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.filter-label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  margin-bottom: 4px;
}

/* 筛选成员 */
.my-filter-enter-active {
  animation: expandIn 0.3s ease-out;
}

.my-filter-leave-active {
  animation: expandOut 0.3s ease-out;
}

/* 筛选成员动画 */
@keyframes expandIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes expandOut {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(10px);
    opacity: 0;
  }
}

.dark .filter-label {
  color: #d1d5db;
}

.search-input {
  width: 100%;
  max-width: 400px;
}

.filter-select {
  width: 200px;
}

.filter-select-option {
  height: 10vh;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.dark .section-title {
  color: #f9fafb;
}

.participant-option-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.status-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.dark .status-section {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e2e8f0;
}

.status-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
}

.status-filter-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 180px;
}

.status-label-container {
  display: flex;
  justify-content: center;
}

.status-tag {
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-select {
  width: 100%;
}

.status-option-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.action-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-weight: 600;
}

.dark .action-section {
  background: rgba(30, 41, 59, 0.8);
  border-color: #475569;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: right;
}

.reset-btn {
  border: 2px solid #6b7280;
  color: #6b7280;
  font-weight: 600;
}

.reset-btn.switch-theme {
  border: 2px solid #806b6b;
  color: #806b6b;
  font-weight: 600;
}

.reset-btn:hover {
  border-color: #4b5563;
  color: #4b5563;
  background-color: #cfd6e3;
}

.reset-btn.switch-theme:hover {
  border-color: #634b4b;
  color: #634b4b;
  background-color: #e3cfcf;
}

.search-btn {
  background: var(--project-theme-color);
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: color-mix(in srgb, var(--project-theme-color) 70%, black);
}

/* 筛选器 样式 */
@media (max-width: 1250px) {
  .filter-container {
    padding: 16px;
  }

  .search-section {
    padding: 16px;
  }

  .search-section .flex {
    flex-direction: column;
    gap: 16px;
  }

  .filter-item {
    min-width: 100%;
  }

  .search-input {
    max-width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .status-filters {
    flex-direction: column;
    gap: 16px;
  }

  .status-filter-item {
    min-width: 100%;
  }

  .action-section .flex {
    flex-direction: column;
    gap: 16px;
  }

  .action-buttons {
    width: 100%;
    justify-content: right;
  }
}

/* Element Plus 组件样式覆盖 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
}

:deep(.el-tag) {
  border-radius: 8px;
}
</style>
