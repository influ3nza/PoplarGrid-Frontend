<script setup lang="ts">
import SplitView from "@/components/SplitView.vue";
import {Source} from "@/types";
import {ref} from "vue";

const props = defineProps({
  initialMarks: {type: Array<Source>, required: true} // 标记数组
})
const activeMode = ref(0) // 默认翻译模式
</script>

<template>
  <div class="w-full h-full bg-white">
    <div v-if="initialMarks.length === 0"
         style="display: flex; color: black; height: 100%; align-items: center; text-align: center; justify-content: center">
      左键点击图片新增框内标记<br>右键点击图片新增框外标记<br>右键点击标记来删除标记
    </div>
    <div v-else class="flex flex-col w-full h-full">
      <div class="flex w-full gap-x-0">
        <button
            class="flex-1 py-1 font-medium transition-colors min-w-[90px]"
            :class="activeMode === 0
        ? 'bg-blue-500 text-white'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'"
            @click="activeMode = 0">
          翻译模式
        </button>

        <button
            class="flex-1 py-1 font-medium transition-colors min-w-[90px]"
            :class="activeMode === 1
        ? 'bg-blue-500 text-white'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'"
            @click="activeMode = 1">
          校对模式
        </button>

        <button
            class="flex-1 py-1 font-medium transition-colors min-w-[90px]"
            :class="activeMode === 2
        ? 'bg-blue-500 text-white'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'"
            @click="activeMode = 2">
          全能模式
        </button>
      </div>

      <div class="flex-1">
        <split-view orientation="vertical">
          <template #first>
            <div class="flex flex-col w-full h-full relative">
              <div
                  class="tr1-button"
                  v-if="activeMode === 0"
                  v-for="(tag, index) in props.initialMarks"
                  @click="() => {console.log('clicked', tag.id)}"
              >
                <div class="tr1-index">
                  {{ index + 1 }}
                </div>
                <div class="tr1-content">
                  {{ tag.my_translation ? tag.my_translation.content : "" }}
                </div>
              </div>
            </div>
          </template>
          <template #second>
            <div class="w-full h-full relative" style="border-top: 3px solid #f0f0f0">0000</div>
          </template>
        </split-view>
      </div>
    </div>

  </div>
</template>

<style scoped>
.tr1-button {
  display: flex;
  padding: 5px;
  border-left: 5px solid #d0d0d0;
}

.tr1-button:not(:last-child) {
  border-bottom: 1px solid #d0d0d0;
}

.tr1-button:hover {
  background-color: #c9c9c9;
}

.tr1-index {
  color: #808080;
  padding-left: 5px;
  padding-right: 10px;
  user-select: none;
}

.tr1-content {
  color: #000000;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>