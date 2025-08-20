<script setup lang="ts">
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useMovable} from "@/utils/movable.ts";

const props = defineProps({
  src: {type: String, required: true},
  scale: {type: Number, default: 1}
})
const emit = defineEmits(['imageLoaded', 'click', 'sizeChanged', 'update:scale'])
defineExpose({
  resetPosition: () => {
    resetImagePosition()
  },
  resetScaleByX: () => {
    resetScale(imageScaleByX)
  },
  resetScaleByY: () => {
    resetScale(imageScaleByY)
  },
  onLayoutChanged: () => {
    recalculateResetPos(transform.scale)
  }
})

const container = ref<HTMLElement | null>(null)
const imageEl = ref<HTMLImageElement>()
const imageWidth = ref(0)
const imageHeight = ref(0)
const {transform, transformStyle, isDragging} = useMovable(container, {
  zoomEnabled: true,
  click: (e: MouseEvent) => emit('click', e)
})

const imageResetPos = {
  x: 0,
  y: 0
}
let imageScaleByX = 1
let imageScaleByY = 1
let firstLoad = true

const onImageLoaded = () => {
  const parentRect = container.value?.parentElement?.getBoundingClientRect()
  const image = imageEl.value
  if (!image || !parentRect) return

  imageHeight.value = image.naturalHeight
  imageWidth.value = image.naturalWidth

  imageScaleByY = parentRect.height / imageHeight.value
  imageScaleByX = parentRect.width / imageWidth.value
  transform.scale = imageScaleByY
}

const resetImagePosition = () => {
  transform.x = imageResetPos.x
  transform.y = imageResetPos.y
}

const resetScale = (scale: number) => {
  transform.scale = scale
  nextTick(resetImagePosition)
}

watch(() => props.scale, val => {
  transform.scale = val
})

function debounce(fn: any, delay: number) {
  let timer: any
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const updateSize = debounce(() => {
  recalculateResetPos(transform.scale)
}, 100)

onMounted(() => {
  window.addEventListener('resize', updateSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize)
})

const recalculateResetPos = (scale: number) => {
  const parentRect = container.value?.parentElement?.getBoundingClientRect()
  if (imageWidth.value == 0 || imageHeight.value == 0 || !parentRect) return
  imageResetPos.x = (parentRect.width - imageWidth.value * scale) / 2
  imageResetPos.y = (parentRect.height - imageHeight.value * scale) / 2
  imageScaleByY = parentRect.height / imageHeight.value
  imageScaleByX = parentRect.width / imageWidth.value
}

watch(() => transform.scale, newScale => {
  recalculateResetPos(newScale)
  // 首次加载
  if (firstLoad) {
    firstLoad = false
    resetImagePosition()
    emit('imageLoaded', imageWidth.value, imageHeight.value)
  }
  emit('update:scale', newScale)
  emit('sizeChanged', {width: imageWidth, height: imageHeight})
})

</script>

<template>
  <div ref="container"
       class="absolute top-0 left-0 flex"
       :style="transformStyle"
       draggable="false"
       :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
  >
    <img ref="imageEl"
         class="block max-w-none"
         :src="props.src"
         alt="TranslatorImageBG"
         @contextmenu.prevent
         draggable="false"
         @load="onImageLoaded"
    />
    <slot :scale="transform.scale" :imageWidth="imageWidth" :imageHeight="imageHeight"/>
  </div>
</template>
