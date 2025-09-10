<template>
  <el-card :style="{
        'background-color': getBgColor(user_status),
      }" class="project-user-status">
    <!-- 正在加载中 -->
    <el-card
      v-if="user_status === null"
      class="status-alert"
    >
      <div class="alert-content">
        <span>正在获取你的项目状态，屏气凝神！</span>
        <el-button type="info" disabled size="default" class="action-button">
          正在加载中
        </el-button>
      </div>
    </el-card>

    <!-- 未加入项目状态 -->
    <el-card
      v-if="user_status === 0"
      class="status-alert"
    >
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
    </el-card>

    <!-- 已加入项目状态 -->
    <el-card
      v-if="user_status === 1"
      class="status-alert"
    >
      <div class="alert-content">
        <div class="status-text">
          <span>你已于{{ user_labor!.joinedTime }}加入此项目，角色为</span>
          <el-tag size="large" class="role-tag">
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
        <el-button
          type="danger"
          size="default"
          icon="Failed"
          class="action-button"
        >
          退出项目
        </el-button>
      </div>
    </el-card>

    <!-- 已发出申请状态 -->
    <el-card
      v-if="user_status === 2"
      class="status-alert"
    >
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
    </el-card>

    <!-- 收到邀请状态 -->
    <el-card
      v-if="user_status === 3"
      class="status-alert"
    >
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
    </el-card>
  </el-card>
</template>

<script setup lang="ts">
import { MemberLabor } from "@/types";
import { generateRoleByMask } from "@/utils/userAbility";

interface Props {
  user_status: number | null;
  user_labor: MemberLabor | null;
}

defineProps<Props>();

const getBgColor = (status: number | null): string => {
  switch (status) {
    case null:
      return "#d9d9d9";
    case 0:
      return "#f2c7c7";
    case 1:
      return "#c9f1c6";
    case 2:
      return "#f2e3c7";
    case 3:
      return "#c7f2f2";
    default:
      return "#d9d9d9";
  }
};
</script>

<style scoped>
.project-user-status {
  font-size: 20px;
  font-weight: 600;

  .el-tag {
    font-size: 16px;
    font-weight: 600;
  }

  .el-button {
    font-size: 16px;
    font-weight: 600;
  }
}

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
</style>
