<template>
  <span ref="tooltipRef">
    <slot/>
  </span>
</template>

<script setup>
import {onMounted, onBeforeUnmount, ref, watch} from 'vue'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale-subtle.css';

const props = defineProps({
  content: {type: [String, Object], required: true},
  arrow: {type: [String, Boolean], default: true},
  placement: {type: String, default: 'auto'},
  animation: {type: String, default: 'scale-subtle'},
  theme: {type: String, default: 'translucent'},
  trigger: {type: String, default: 'mouseenter focus'},
  allowHTML: {type: Boolean, default: true},
  offset: {type: Array, default: [0, 20]},
  duration: {type: Array, default: [0, 100]}
})

const tooltipRef = ref(null)
let instance = null

// 暴露实例给父组件使用
defineExpose({
  get instance() {
    return instance;
  },
  enable() {
    if (instance) instance.enable();
  },
  disable() {
    if (instance) instance.disable();
  },
  show() {
    if (instance) instance.show();
  },
  hide() {
    if (instance) instance.hide();
  }
});

onMounted(() => {
  createTooltip()
})

onBeforeUnmount(() => {
  if (instance) instance.destroy()
})

watch(() => props.content, (newVal) => {
  if (instance) {
    instance.setContent(newVal)
  }
})

function createTooltip() {
  if (tooltipRef.value) {
    instance = tippy(tooltipRef.value, {
      content: props.content,
      placement: props.placement,
      animation: props.animation,
      theme: props.theme,
      arrow: props.arrow,
      trigger: props.trigger,
      allowHTML: props.allowHTML,
      offset: props.offset,
      duration: props.duration
    })
  }
}
</script>