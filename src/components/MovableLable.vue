<script lang="ts" setup>
import ToolTip from "@/components/ToolTip.vue";
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {useMovable} from "@/utils/movable.ts";
import tippy, {Instance as TippyInstance} from 'tippy.js';
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale-subtle.css';
import {FocusTagEvent, TRANSLATOR_EVENTS, translatorEvent, useTranslatorEvent} from "@/utils/translatorEvent.ts";

const props = defineProps({
  x: {type: Number, required: true},
  y: {type: Number, required: true},
  w: {type: Number, required: true},
  h: {type: Number, required: true},
  id: {type: String, required: true},
  index: {type: Number, default: 0},
  scale: {type: Number, default: 1},
  status: {type: String, default: 'pending'},
  positionType: {type: Number, default: 0},
  allowMove: {type: Boolean, default: true},
  active: {type: Boolean, default: false},
  focus: {type: Boolean, default: false},
  content: String,
  styleTransition: {type: String, default: 'none'},
  direction: {type: String, default: 'ltr'},
  writingMode: {type: String, default: 'vertical-rl'},
  originDirection: {type: String, default: 'ltr'},
  originWritingMode: {type: String, default: 'vertical-rl'},
  className: String,
})
const tipText = ref(props.content)
const tipTextTip = computed(() => tipText.value?.replace(/\n/g, '<br>'))
watch(() => props.content, (newVal) => {
  tipText.value = newVal
})
const myScale = computed(() => 1 / props.scale)
const handleElem = ref()
const tooltipComponent = ref()
const labelZIndex = ref(1)
const isFocusd = ref(false)
let contextMenuTimer: any = null
let contextMenuVisible = false
let contextMenuInstance: TippyInstance | null = null
let editTimer: any = null
let originalContent = ''
let hasContentChanged = false

// 创建右键菜单的内容
const createContextMenuContent = () => {
  const div = document.createElement('div');
  div.className = 'context-menu';
  div.innerHTML = `
    <div class="context-menu__content">
      <div class="context-menu__section">
        <textarea
          class="context-menu__textarea"
          placeholder="编辑内容..."
          rows="3"
        >${props.content || ''}</textarea>
      </div>
      <div class="context-menu__section">
        <div class="flex gap-2 flex-initial">
          <button class="context-menu__btn context-menu__btn--primary" data-action="copy">
            复制
          </button>
          <button class="context-menu__btn" data-action="duplicate">
            复制标签
          </button>
          <button class="context-menu__btn context-menu__btn--danger" data-action="delete">
            删除
          </button>
        </div>
      </div>
    </div>
  `;

  return div;
};

// 处理文本编辑
const handleTextEdit = (textarea: HTMLTextAreaElement) => {
  const currentContent = textarea.value;
  if (currentContent !== originalContent) {
    hasContentChanged = true;

    // 清除之前的定时器
    if (editTimer) {
      clearTimeout(editTimer);
    }

    // 设置新的定时器
    editTimer = setTimeout(() => {
      eventBus.emitUpdateTag(props.id, currentContent);
      originalContent = currentContent;
      hasContentChanged = false;
      editTimer = null;
    }, 500);
  }
};

// 强制触发编辑事件
const forceEmitEdit = (textarea: HTMLTextAreaElement) => {
  if (hasContentChanged && editTimer) {
    clearTimeout(editTimer);
    const currentContent = textarea.value;
    eventBus.emitUpdateTag(props.id, currentContent);
    originalContent = currentContent;
    hasContentChanged = false;
    editTimer = null;
  }
};

// 初始化右键菜单
const initContextMenu = () => {
  if (!handleElem.value) return;

  contextMenuInstance = tippy(handleElem.value, {
    content: createContextMenuContent(),
    trigger: 'manual',
    placement: 'right',
    interactive: true,
    arrow: true,
    theme: 'light',
    animation: 'scale-subtle',
    hideOnClick: true,
    zIndex: 9999, // 设置最高层级
    appendTo: 'parent', // 确保添加到正确的容器
    duration: [20, 100],
    maxWidth: 'none',
    onShow(instance) {
      // 提升当前标签的 z-index 到最高层
      labelZIndex.value = 9998;
      // 禁用 ToolTip 以防止冲突
      if (tooltipComponent.value) {
        tooltipComponent.value.disable();
      }

      const content = instance.popper.querySelector('.context-menu__textarea') as HTMLTextAreaElement;
      const menuElement = instance.popper.querySelector('.context-menu') as HTMLElement;

      if (content) {
        originalContent = props.content || '';
        content.value = originalContent;
        hasContentChanged = false;

        // 监听输入事件
        content.addEventListener('input', () => handleTextEdit(content));
      }

      // 阻止菜单内部的所有事件传播
      if (menuElement) {
        menuElement.addEventListener('mousedown', (e) => {
          e.stopPropagation();
        });
        menuElement.addEventListener('mouseup', (e) => {
          e.stopPropagation();
        });
        menuElement.addEventListener('click', (e) => {
          e.stopPropagation();
        });
        menuElement.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        menuElement.addEventListener('mousemove', (e) => {
          e.stopPropagation();
        });
        menuElement.addEventListener('mouseenter', (e) => {
          e.stopPropagation();
        });
        menuElement.addEventListener('mouseleave', (e) => {
          e.stopPropagation();
        });
        // 阻止键盘事件传播
        menuElement.addEventListener('keydown', (e) => {
          e.stopPropagation();
        });
        menuElement.addEventListener('keyup', (e) => {
          e.stopPropagation();
        });
      }

      // 添加按钮事件监听
      const buttons = instance.popper.querySelectorAll('[data-action]');
      buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation(); // 阻止事件传播
          const action = (e.target as HTMLElement).dataset.action;
          handleButtonClick(action!, content);
        });
      });

      contextMenuVisible = true;
    },
    onHide(instance) {
      // 重新启用 ToolTip
      if (tooltipComponent.value) {
        tooltipComponent.value.enable();
      }

      const textarea = instance.popper.querySelector('.context-menu__textarea') as HTMLTextAreaElement;
      if (textarea) {
        // 关闭前检查是否需要强制触发编辑事件
        forceEmitEdit(textarea);
      }
      contextMenuVisible = false;
    }
  });
};

// 处理按钮点击
const handleButtonClick = (action: string, textarea: HTMLTextAreaElement) => {
  // 确保在执行按钮操作前保存文本更改
  forceEmitEdit(textarea);

  switch (action) {
    case 'copy':
      navigator.clipboard.writeText(textarea.value).then(() => {
        console.log('内容已复制到剪贴板');
      }).catch(() => {
        console.log('复制失败');
      });
      break;
    case 'duplicate':
      console.log('复制标签功能待实现');
      emit('tag-event', 'duplicate', props.id);
      break;
    case 'delete':
      console.log('删除标签功能待实现');
      emit('tag-event', 'delete', props.id);
      break;
  }

  // 关闭右键菜单
  if (contextMenuInstance) {
    contextMenuInstance.hide();
  }
};

const eventBus = useTranslatorEvent()
const {transform, isDragging} = useMovable(handleElem, {
  initialX: props.x,
  initialY: props.y,
  accelerateFactor: myScale,
  transformOrigin: "bottom",
  click: (e: MouseEvent) => {
    //if (!contextMenuVisible) {
    //emit('tag-event', 'click', props.id, e)
    //}
  },
  drag: (e: MouseEvent, x: number, y: number) => eventBus.emitMoveTag(props.id, x, y),
  mousedown: (e: MouseEvent) => {
    if (e.button === 2) {
      contextMenuTimer = setTimeout(() => {
        if (contextMenuInstance) {
          contextMenuInstance.show();
        }
        contextMenuTimer = null;
      }, 500)
    }
  },
  mouseup: (e: MouseEvent) => {
    if (contextMenuTimer) {
      clearTimeout(contextMenuTimer)
      contextMenuTimer = null
    }
  },
  constraints: {
    minX: 0,
    maxX: props.w,
    minY: 0,
    maxY: props.h
  }
})

const active = ref(false)
const isMobile = ref(false)
const backgroundRGB = computed(() => {
  if (props.positionType === 2) {
    return '255, 213, 131'; // 黄色
  }
  return '255, 150, 156'; // 粉色
})

// 计算小箭头指向点的偏移，使小箭头的尖角为指向点
const arrowWidth = computed(() => {
  if (active) {
    return 8 * 1.4;
  }
  return 8; // 等腰三角形的底边
})
const arrowHeight = computed(() => {
  if (active) {
    return 5 * 1.4;
  }
  return 5; // 等腰三角形的高
})
const numberSize = 29; // 数字圆圈的直径
const numberTop = computed(() => {
  if (isMobile) {
    return -32;// 手机版数字圆圈距离更远，以免小箭头被手挡住
  }
  return -16; // 数字圆圈的偏移
});

const numberBorderSize = 2;

const savingStatuses = ['saving', 'syncing', 'uploading'] // 对应原来的 labelSavingStatuses

const saving = computed(() => savingStatuses.includes(props.status))
// 样式类和动态 style
const rootClasses = computed(() => [
  'Label',
  {
    'Label--focus': isFocusd.value,
    'Label--active': props.active,
    'Label--saving': saving.value,
  },
])

const rootStyle = computed(() => ({
  transform: `matrix(${transform.scale}, 0, 0, ${transform.scale}, ${transform.x}, ${transform.y}`,
  transformOrigin: 'bottom',
  transition: props.styleTransition,
  zIndex: labelZIndex.value, // 动态 z-index
}))

// 箭头方向
const arrowClass = computed(() => {
  const base = 'Label__Arrow'
  if (props.writingMode.startsWith('vertical')) return [base, 'Label__Arrow--bottom']
  if (props.writingMode === 'horizontal-tb') {
    return [
      base,
      props.direction === 'ltr' ? 'Label__Arrow--right' : 'Label__Arrow--left',
    ]
  }
  return [base]
})

const handleFocus = (e: FocusTagEvent) => {
  isFocusd.value = e.id === props.id;
}

onMounted(() => {
  translatorEvent.on(TRANSLATOR_EVENTS.FOCUS_TAG, handleFocus)
  nextTick(() => {
    initContextMenu();
  });
});

onUnmounted(() => {
  translatorEvent.off(TRANSLATOR_EVENTS.FOCUS_TAG, handleFocus)
  if (contextMenuInstance) {
    contextMenuInstance.destroy();
  }
  if (editTimer) {
    clearTimeout(editTimer);
  }
  if (contextMenuTimer) {
    clearTimeout(contextMenuTimer);
  }
});
</script>

<template>
  <div :style="rootStyle"
       class="absolute flex top-0 left-0"
  >
    <div
        :class="rootClasses"
        :style="{
          transform:`scale(${myScale}) translateZ(0)`,
          transformOrigin: `bottom`,
          transition: 'none'
        }"
        @contextmenu.prevent
    >
      <div class="Label__FocusRing"/>
      <ToolTip ref="tooltipComponent" :content="tipTextTip" placement="right" :arrow="false" :offset="[-30, 25]">
        <div class="Label__Number" ref="handleElem" @contextmenu.prevent>
          {{ index }}
        </div>
      </ToolTip>
      <div :class="arrowClass"/>
      <div class="Label__Spin" v-if="saving">
        <div/>
      </div>
      <div class="Label__ContentWrapper">
      </div>
    </div>
  </div>
</template>

<style scoped>
.Label {
}

@keyframes focus-ring-animate {
  0% {
    opacity: 0;
    transform: scale(2.5);
    border-width: 1.8px;
  }
  10% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
    transform: scale(1);
    border-width: 2px;
  }
}

.Label__ContentWrapper {
  display: none;
  position: absolute;
  top: -60px;
  left: 36px;
  width: 220px;
}

.Label__Content {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  padding: 3px 5px;
  white-space: pre-wrap;
  word-break: break-word;
}

.Label__Content--empty {
  color: #999;
}

.Label__FocusRing {
  display: none;
  position: absolute;
  pointer-events: none;
  border: 1.8px solid rgb(v-bind('backgroundRGB'));
  width: 29px;
  height: 29px;
  top: -45px;
  left: -14.5px;
  border-radius: 50%;
  animation: focus-ring-animate 2s linear infinite normal;
}

.Label--focus .Label__Number {
  top: -16px;
  background-color: rgba(v-bind('backgroundRGB'), 1);
  border: 2px solid #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.Label--focus .Label__FocusRing {
  display: block;
}

.Label__Number {
  position: absolute;
  top: -16px;
  left: 0;
  transform: translate(-50%, -100%);
  width: 29px;
  height: 29px;
  line-height: 29px;
  border-radius: 50%;
  background-color: rgba(v-bind('backgroundRGB'), 0.7);
  color: #fff;
  font-size: 16px;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: sans-serif;
  cursor: pointer;
}

.Label__Arrow {
  position: absolute;
  top: -4px;
  left: -4px;
}

.Label__Arrow--bottom {
  border-style: solid;
  border-width: 5px 4px 0 4px;
  border-color: #1890ff transparent transparent transparent;
}

.Label__Arrow--left {
  border-style: solid;
  border-width: 4px 5px 4px 0;
  border-color: transparent #1890ff transparent transparent;
}

.Label__Arrow--right {
  border-style: solid;
  border-width: 4px 0 4px 5px;
  border-color: transparent transparent transparent #1890ff;
}

.Label__Spin {
  display: none;
  position: absolute;
  left: -9px;
  top: -12px;
}

.Label--saving .Label__Spin {
  display: block;
}

@media (pointer: fine) {
  .Label:hover .Label__Number {
    top: -16px;
    background-color: rgba(v-bind('backgroundRGB'), 1);
    border: 2px solid #fff;
  }

  .Label:hover .Label__ContentWrapper {
    display: flex;
  }
}

/* 右键菜单样式 */
:global(.tippy-box[data-theme~='light']) {
  background-color: #fff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 0;
  z-index: 10000 !important; /* 确保在最高层级 */
  cursor: initial;
}

:global(.tippy-box[data-theme~='light'] .tippy-arrow) {
  color: #fff;
}

:global(.context-menu) {
  min-width: 300px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  z-index: 10001;
  /* 阻止事件穿透 */
  pointer-events: auto;
}

:global(.context-menu__content) {
  padding: 4px 0;
}

:global(.context-menu__section) {
  padding: 4px 8px;
}

:global(.context-menu__section:not(:last-child)) {
  border-bottom: 1px solid #f0f0f0;
}

:global(.context-menu__textarea) {
  width: 100%;
  min-height: 60px;
  min-width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: both;
  outline: none;
  transition: border-color 0.2s;
  /* 阻止事件穿透 */
  pointer-events: auto;
  /* 确保文本选择正常工作 */
  user-select: text;
}

:global(.context-menu__textarea:focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

:global(.context-menu__btn) {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  /* 阻止事件穿透 */
  pointer-events: auto;
  user-select: none;
}

:global(.context-menu__btn:hover) {
  border-color: #1890ff;
  color: #1890ff;
}

:global(.context-menu__btn--primary) {
  background: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

:global(.context-menu__btn--primary:hover) {
  background: #40a9ff;
  border-color: #40a9ff;
}

:global(.context-menu__btn--danger) {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

:global(.context-menu__btn--danger:hover) {
  background: #ff4d4f;
  color: #fff;
}
</style>