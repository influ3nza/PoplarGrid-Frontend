<template>
  <div
      class="split-pane"
      ref="root"
      :class="orientationClass"
      :style="{ '--gutter': gutter + 'px' }"
  >
    <div class="pane first" :style="firstPaneStyle">
      <slot name="first"/>
    </div>

    <div
        class="gutter"
        role="separator"
        :aria-orientation="orientation"
        tabindex="0"
        @pointerdown="onPointerDown"
    />

    <div class="pane second" :style="secondPaneStyle">
      <slot name="second"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: number
  defaultRatio?: number
  minFirst?: number
  minSecond?: number
  gutter?: number
  persistKey?: string | null
  orientation?: 'horizontal' | 'vertical'
}>(), {
  modelValue: undefined,
  defaultRatio: 0.75,
  minFirst: 10,
  minSecond: 10,
  gutter: 4,
  persistKey: null,
  orientation: 'horizontal'
})

const emit = defineEmits(['update:modelValue', 'change'])

const root = ref<HTMLDivElement | null>(null)
const containerSize = ref(0)
const ratio = ref<number>(props.defaultRatio)
const minRatioFirst = computed(() => props.minFirst / containerSize.value)
const minRatioSecond = computed(() => props.minSecond / containerSize.value)

onMounted(() => {
  const stored = props.persistKey ? localStorage.getItem(keyName()) : null
  updateContainerSize()
  if (stored != null) {
    const v = clamp(parseFloat(stored), minRatioFirst.value, 1 - (minRatioSecond.value))
    ratio.value = Number.isFinite(v) ? v : props.defaultRatio
  } else if (typeof props.modelValue === 'number') {
    ratio.value = clamp(props.modelValue, minRatioFirst.value, 1 - (minRatioSecond.value))
  } else {
    ratio.value = clamp(props.defaultRatio, minRatioFirst.value, 1 - (minRatioSecond.value))
  }
  ro = new ResizeObserver(updateContainerSize)
  root.value && ro.observe(root.value)
})

let ro: ResizeObserver | null = null
onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  removeGlobalListeners()
})

watch(() => props.modelValue, (v) => {
  if (typeof v === 'number' && dragging.value === false) {
    ratio.value = clamp(v, minRatioFirst.value, 1 - (minRatioSecond.value))
  }
})

watch(ratio, (v) => {
  persist(v)
  emit('update:modelValue', v)
  emit('change', v)
})

function keyName() {
  return `split-pane:${props.persistKey}`
}

function persist(v: number) {
  if (!props.persistKey) return
  try {
    localStorage.setItem(keyName(), String(v))
  } catch {
  }
}

function updateContainerSize() {
  if (!root.value) return
  const rect = root.value.getBoundingClientRect()
  containerSize.value = props.orientation === 'horizontal' ? rect.width : rect.height
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

const dragging = ref(false)
let startPos = 0
let startFirstSize = 0

const firstPaneSize = computed(() => Math.round(containerSize.value * ratio.value))
const secondPaneSize = computed(() => Math.round(containerSize.value * (1 - ratio.value)))
const firstPaneStyle = computed(() => {
  return props.orientation === 'horizontal'
      ? {width: firstPaneSize.value + 'px'}
      : {height: firstPaneSize.value + 'px'}
})
const secondPaneStyle = computed(() => {
  return props.orientation === 'horizontal'
      ? {width: secondPaneSize.value + 'px'}
      : {height: secondPaneStyle.value + 'px'}
})

const orientationClass = computed(() => props.orientation === 'vertical' ? 'vertical' : 'horizontal')

function onPointerDown(e: PointerEvent) {
  if (!root.value) return
      ;
  (e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  dragging.value = true
  startPos = props.orientation === 'horizontal' ? e.clientX : e.clientY
  startFirstSize = firstPaneSize.value
  addGlobalListeners()
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const currentPos = props.orientation === 'horizontal' ? e.clientX : e.clientY
  const delta = currentPos - startPos
  const newSize = startFirstSize + delta

  const newRatio = clamp(newSize / containerSize.value, minRatioFirst.value, 1 - minRatioSecond.value)
  ratio.value = newRatio
}

function onPointerUp() {
  dragging.value = false
  removeGlobalListeners()
}

function addGlobalListeners() {
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function removeGlobalListeners() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}
</script>

<style scoped>
.split-pane {
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.split-pane.horizontal {
  flex-direction: row;
}

.split-pane.vertical {
  flex-direction: column;
}

.pane {
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

.gutter {
  background: transparent;
  position: relative;
}

.horizontal .gutter {
  width: 0; /* 视觉上消失 */
  cursor: col-resize;
  height: 100%; /* 撑满容器高度 */
  position: relative;
}

.vertical .gutter {
  height: 0; /* 视觉上消失 */
  cursor: row-resize;
  width: 100%; /* 撑满容器宽度 */
  position: relative;
}

/* 横向模式：左右各扩展一半 */
.horizontal .gutter::after {
  z-index: 9999;
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -3px;
  right: -3px;
  transition: background-color ease-in 0.5s;
}

.horizontal .gutter:hover::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -3px;
  right: -3px;
  background-color: #9ca3af;
  transition: background-color ease-in 0.5s;
}

.vertical .gutter::after {
  z-index: 9999;
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -4px;
  bottom: -4px;
  transition: background-color ease-in 0.5s;
}

.vertical .gutter:hover::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -4px;
  bottom: -4px;
  background-color: #9ca3af;
  transition: background-color ease-in 0.5s;
}
</style>
