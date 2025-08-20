import {computed, onBeforeUnmount, onMounted, reactive, ref, Ref} from 'vue'

interface useMovableOptions {
    initialX?: number,
    initialY?: number,
    initialScale?: number,
    accelerateFactor?: Ref<number>,
    zoomEnabled?: boolean,
    constraints?: any,
    transformOrigin?: string,
    transitionStyle?: string,
    mousedown?: any,
    mouseup?: any,
    mousemove?: any,
    click?: any,
    drag?: any
}

export function useMovable(
    elRef: Ref<HTMLElement | null>,
    options: useMovableOptions = {}
) {
    const {
        initialX = 0,
        initialY = 0,
        initialScale = 1,
        accelerateFactor = ref(1),
        zoomEnabled = false,
        constraints = null,
        transformOrigin = '0 0',
        transitionStyle = 'none', //FixMe: 'transform 0.1s ease-out' can cause child elements to behave strangely
        click = () => {
        },
        drag = () => {
        },
        mousedown = () => {
        },
        mouseup = () => {
        },
        mousemove = () => {
        }
    } = options

    const transform = reactive({x: initialX, y: initialY, scale: initialScale})
    const prevTransform = {x: 0, y: 0}

    const isDragging = ref(false)
    const origin = ref(transformOrigin)
    const transformStyle = computed(() => ({
        transform: `matrix(${transform.scale}, 0, 0, ${transform.scale}, ${transform.x}, ${transform.y})`,
        transformOrigin: origin.value,
        transition: isDragging.value ? 'none' : transitionStyle
    }))

    const clampPos = (x: number, y: number) => {
        if (!constraints) {
            transform.x = x
            transform.y = y
        } else {
            transform.x = Math.max(constraints.minX, Math.min(constraints.maxX, x))
            transform.y = Math.max(constraints.minY, Math.min(constraints.maxY, y))
        }
    }

    function onMouseDown(e: MouseEvent) {
        isDragging.value = true
        prevTransform.x = e.x
        prevTransform.y = e.y
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        mousedown(e)
        e.preventDefault()
        e.stopPropagation()
    }

    function onMouseMove(e: MouseEvent) {
        if (!isDragging.value) return
        mousemove(e)
        clampPos(transform.x + e.movementX * accelerateFactor.value, transform.y + e.movementY * accelerateFactor.value)
    }

    function onMouseUp(e: MouseEvent) {
        isDragging.value = false
        mouseup(e)
        if (prevTransform.x === e.x && prevTransform.y === e.y) {
            click(e)
        } else {
            drag(e, transform.x, transform.y)
        }
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
    }

    function onWheel(e: WheelEvent) {
        if (!zoomEnabled || !elRef.value) return;
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.max(0.1, Math.min(5, transform.scale + delta));
        if (newScale === transform.scale) return;

        const container = elRef.value
        const containerRect = container.getBoundingClientRect();

        // 鼠标在图片中的位置
        const mouseX = (e.clientX - containerRect.left);
        const mouseY = (e.clientY - containerRect.top);

        //鼠标在缩放后的图片中相对原位置的差值
        const deltaX = (mouseX / containerRect.width) * (container?.clientWidth * newScale) - mouseX
        const deltaY = (mouseY / containerRect.height) * (container?.clientHeight * newScale) - mouseY

        // 更新 scale
        transform.scale = newScale;

        // 缩放后，应调整 pos 以保证鼠标指向不变
        clampPos(transform.x - deltaX, transform.y - deltaY)
    }

    onMounted(() => {
        elRef.value?.addEventListener('mousedown', onMouseDown)
        elRef.value?.addEventListener('wheel', onWheel)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
    })

    return {
        transform,
        transformStyle,
        isDragging
    }
}