import {reactive} from 'vue'


export interface FocusTagEvent {
    id: string
}

export interface MoveTagEvent {
    id: string
    x: number
    y: number
}

export interface DeleteTagEvent {
    id: string
}

export interface UpdateTagEvent {
    id: string
    text: string
}

export interface UpdateViewerPositionEvent {
    x: number
    y: number
}

export interface CreateTagEvent {
    x: number
    y: number
    position_type: number
}

// 事件映射类型
export interface EventMap {
    focus_tag: FocusTagEvent
    move_tag: MoveTagEvent
    delete_tag: DeleteTagEvent
    update_tag: UpdateTagEvent
    update_viewer_position: UpdateViewerPositionEvent
    create_tag: CreateTagEvent
}

type EventCallback<T> = (data: T) => void

class TranslatorEventBus {
    private events: Record<string, EventCallback<any>[]>

    constructor() {
        this.events = reactive({})
    }

    on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
        if (!this.events[event]) {
            this.events[event] = []
        }
        this.events[event].push(callback)
    }

    off<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
        if (!this.events[event]) return
        const index = this.events[event].indexOf(callback)
        if (index > -1) {
            this.events[event].splice(index, 1)
        }
    }

    emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
        if (!this.events[event]) return
        this.events[event].forEach(callback => callback(data))
    }

    clear(): void {
        Object.keys(this.events).forEach(key => {
            this.events[key] = []
        })
    }

    clearEvent<K extends keyof EventMap>(event: K): void {
        if (this.events[event]) {
            this.events[event] = []
        }
    }
}

export const translatorEvent = new TranslatorEventBus()

export const TRANSLATOR_EVENTS = {
    FOCUS_TAG: 'focus_tag' as const,
    MOVE_TAG: 'move_tag' as const,
    DELETE_TAG: 'delete_tag' as const,
    UPDATE_TAG: 'update_tag' as const,
    SELECT_SOURCE: 'select_source' as const,
    UPDATE_VIEWER_POSITION: 'update_viewer_position' as const,
    CREATE_TAG: 'create_tag' as const
} as const

// 类型安全的事件发射器钩子
export function useTranslatorEvent() {
    const emitFocusTag = (id: string) => {
        translatorEvent.emit(TRANSLATOR_EVENTS.FOCUS_TAG, {id})
    }

    const emitMoveTag = (id: string, x: number, y: number) => {
        translatorEvent.emit(TRANSLATOR_EVENTS.MOVE_TAG, {id, x, y})
    }

    const emitDeleteTag = (id: string) => {
        translatorEvent.emit(TRANSLATOR_EVENTS.DELETE_TAG, {id})
    }

    const emitUpdateTag = (id: string, text: string) => {
        translatorEvent.emit(TRANSLATOR_EVENTS.UPDATE_TAG, {id, text})
    }

    const emitUpdateViewerPosition = (x: number, y: number) => {
        translatorEvent.emit(TRANSLATOR_EVENTS.UPDATE_VIEWER_POSITION, {x, y})
    }

    const emitCreateTag = (x: number, y: number, position_type: number) => {
        translatorEvent.emit(TRANSLATOR_EVENTS.CREATE_TAG, {x, y, position_type})
    }

    return {
        emitFocusTag,
        emitMoveTag,
        emitDeleteTag,
        emitUpdateTag,
        emitUpdateViewerPosition,
        emitCreateTag
    }
}