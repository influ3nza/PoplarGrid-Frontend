<template>
  <div class="translator-nav-toolbar absolute z-30 bottom-[2vh] left-[2vh] flex bg-white/80 rounded shadow-xl"
       :style="transformStyle"
       @mouseenter="toolbarMouseEnter"
       @mouseleave="toolbarMouseLeave"
  >
    <div
        ref="floatBarHandle"
        :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
    >
      <el-icon class="text-gray-600 align-middle flex m-3" size="25px">
        <Rank/>
      </el-icon>
    </div>
    <div class="translator-nav-toolbar-scalable flex" :class="{expanded:isToolbarActive}">
      <ToolTip content="放大">
        <button class="text-gray-800 hover:bg-gray-600/50 active:text-gray-300 transition-colors"
                @click="() => { if(imageScale<5) imageScale+=0.1 }"
        >
          <el-icon class="text-gray-600 align-middle flex m-3" size="25px">
            <ZoomIn/>
          </el-icon>
        </button>
      </ToolTip>
      <ToolTip content="缩小">
        <button class="text-gray-800 hover:bg-gray-600/50 active:text-gray-300 transition-colors"
                @click="() => { if(imageScale-0.1>0.1) imageScale-=0.1 }"
        >
          <el-icon class="text-gray-600 align-middle flex m-3" size="25px">
            <ZoomOut/>
          </el-icon>
        </button>
      </ToolTip>
      <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          v-model.number="imageScale"
          class="accent-neutral-400 zoom-slider m-3"
      >
      <ToolTip content="重置图片位移">
        <button class="text-gray-800 hover:bg-gray-600/50 active:text-gray-300 transition-colors"
                @click="imageElement.resetPosition"
        >
          <el-icon class="text-gray-600 align-middle flex m-3" size="25px">
            <Refresh/>
          </el-icon>
        </button>
      </ToolTip>
      <ToolTip content="横向填充">
        <button class="text-gray-800 hover:bg-gray-600/50 active:text-gray-300 transition-colors"
                @click="imageElement.resetScaleByX"
        >
          <el-icon class="text-gray-600 align-middle flex m-3" size="25px">
            <ZoomIn/>
          </el-icon>
        </button>
      </ToolTip>
      <ToolTip content="纵向填充">
        <button class="text-gray-800 hover:bg-gray-600/50 active:text-gray-300 transition-colors"
                @click="imageElement.resetScaleByY"
        >
          <el-icon class="text-gray-600 align-middle flex m-3" size="25px">
            <ZoomIn/>
          </el-icon>
        </button>
      </ToolTip>
  </div>
  </div>
  <TranslatorImage v-if="imageBlobLoaded" ref="imageElement"
                   :src="imageBlobUrl"
                   v-model:scale="imageScale"
                   @imageLoaded="(w: number, h: number) => { imageWidth = w; imageHeight = h; imageLoaded = true }"
  >
    <template #default="{ scale, imageWidth, imageHeight }">
      <TranslationTag v-if="imageLoaded"
                      class="absolute"
                      v-for="(tag, index) in props.initialMarks"
                      :id="tag.id"
                      :index="index + 1"
                      :x="tag.x * imageWidth"
                      :y="tag.y * imageHeight"
                      :w="imageWidth"
                      :h="imageHeight"
                      :scale="scale"
                      @tag-event="(...args:any[]) => { console.log(args) }"
                      :position-type="tag.position_type"
                      :content="tag.my_translation ? tag.my_translation.content : tag.translations[0].content"
      ></TranslationTag>
    </template>
  </TranslatorImage>
  <div v-else-if="error" class="text-red-600 w-full h-full flex items-center justify-center">
    <div style="text-align: center">
      <b>翻译器加载失败：{{ error }}</b>
    </div>
  </div>
  <div v-else class="fixed inset-0 z-40 bg-black/30 flex items-center justify-center">
    <div class="bg-white/80 p-4 rounded shadow-lg">
      <progress :value="imageLoadProgress" max="100" class="w-64 h-4"></progress>
      <div class="text-center mt-2 text-gray-700">加载中 {{ imageLoadProgress }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import ToolTip from "@/components/ToolTip.vue"
import {Rank, Refresh, ZoomIn, ZoomOut} from "@element-plus/icons-vue"
import TranslationTag from "@/components/MovableLable.vue";
import TranslatorImage from "@/components/MovableImage.vue";
import {useMovable} from "@/utils/movable.ts";
import {Source} from "@/types";

const imageWidth = ref(0)
const imageHeight = ref(0)
const imageScale = ref(1)
const floatBarHandle = ref(null)
const {transformStyle, isDragging} = useMovable(floatBarHandle)

const isToolbarActive = ref(false)
let toolbarTimer: any = null
const toolbarMouseEnter = () => {
  isToolbarActive.value = true
  if (toolbarTimer) {
    clearTimeout(toolbarTimer)
    toolbarTimer = null
  }
}

const toolbarMouseLeave = () => {
  toolbarTimer = setTimeout(() => {
    isToolbarActive.value = false
    toolbarTimer = null
  }, 200)
}

const props = defineProps({
  imageUrl: {type: String, required: true},
  initialMarks: {type: Array<Source>, required: true} // 标记数组
})
defineExpose({
  onLayoutChanged: () => {
    imageElement.value.onLayoutChanged()
  }
})

const imageLoaded = ref(false)

const imageLoadProgress = ref(0)
const imageBlobUrl = ref<string>('')
const imageBlobLoaded = ref(false)
const error = ref<string | null>(null)

const loadImageWithProgress = (url: string) => {
  imageBlobLoaded.value = false
  imageLoadProgress.value = 0
  error.value = null
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'blob'

  xhr.onprogress = (event) => {
    if (event.lengthComputable) {
      imageLoadProgress.value = Math.round((event.loaded / event.total) * 100)
    }
  }

  xhr.onload = () => {
    if (xhr.status === 200) {
      const blob = xhr.response
      if (imageBlobUrl.value.length > 0) {
        URL.revokeObjectURL(imageBlobUrl.value)
      }
      imageBlobUrl.value = URL.createObjectURL(blob)
      imageBlobLoaded.value = true
    }
  }

  xhr.onerror = () => {
    error.value = "图片获取失败，请重试"
  }

  xhr.send()
}

onMounted(() => {
  loadImageWithProgress(props.imageUrl)
})

onUnmounted(() => {
  if (imageBlobUrl.value.length > 0) {
    URL.revokeObjectURL(imageBlobUrl.value)
  }
})

// DOM 引用
const imageElement = ref()

const processTagEvent = (event: MouseEvent) => {
  if (event.button === 0) {
    console.log(1)
  } else {
    console.log(2)
  }
}
</script>
<style scoped>
.translator-nav-toolbar-scalable {
  overflow: hidden;
  max-width: 0;
  transition: max-width 0.5s ease-in-out;
}

.translator-nav-toolbar-scalable.expanded {
  max-width: 1000px;
  transition: max-width 0.5s ease-in-out;
}
</style>