// WorshipNow: ProPresenter-style drag-to-select box for slides.
// Press on empty space around the slides and drag; every slide the box touches gets selected.
// Ctrl/Cmd + drag adds to the current selection. Works in the playlist view and the single presentation view.
import { get } from "svelte/store"
import { activePage, selected } from "../../stores"

type SlideRef = { index: number; showId: string }

const IGNORE = ".grid > .main, button, input, textarea, select, a, .item-header, .section, .bottom-bar, .contextMenu, [contenteditable], .scrollbar"
const THRESHOLD = 4
const EDGE = 40

export function slideMarquee(node: HTMLElement) {
    let pointerDown = false
    let dragging = false
    let start = { x: 0, y: 0 } // in scroll-content coordinates of `node`
    let last = { x: 0, y: 0 } // last pointer position (client)
    let container: HTMLElement | null = null
    let showId = ""
    let base: SlideRef[] = []
    let box: HTMLDivElement | null = null
    let scrollTimer: ReturnType<typeof setInterval> | null = null

    function toContent(clientX: number, clientY: number) {
        const rect = node.getBoundingClientRect()
        return { x: clientX - rect.left + node.scrollLeft, y: clientY - rect.top + node.scrollTop }
    }

    function down(e: MouseEvent) {
        if (e.button !== 0 || e.shiftKey || e.altKey) return
        if (get(activePage) !== "show") return

        const target = e.target as HTMLElement | null
        if (!target || target.closest(IGNORE)) return

        const area = (target.closest("[data-item-index]") as HTMLElement | null) || (target.closest("#showArea") as HTMLElement | null)
        if (!area) return
        const firstSlide = area.querySelector("[data-show-id]") as HTMLElement | null
        if (!firstSlide) return

        container = area
        showId = firstSlide.dataset.showId || ""
        const current = get(selected)
        base = (e.ctrlKey || e.metaKey) && current.id === "slide" ? (current.data as SlideRef[]).filter((a) => a?.showId === showId) : []

        pointerDown = true
        dragging = false
        start = toContent(e.clientX, e.clientY)
        last = { x: e.clientX, y: e.clientY }

        window.addEventListener("mousemove", move)
        window.addEventListener("mouseup", up)
    }

    function move(e: MouseEvent) {
        if (!pointerDown) return
        last = { x: e.clientX, y: e.clientY }

        const pos = toContent(e.clientX, e.clientY)
        if (!dragging) {
            if (Math.abs(pos.x - start.x) < THRESHOLD && Math.abs(pos.y - start.y) < THRESHOLD) return
            dragging = true
            box = document.createElement("div")
            box.className = "wn-marquee"
            node.appendChild(box)
            startAutoScroll()
        }

        window.getSelection()?.removeAllRanges()
        update(pos)
    }

    function update(pos = toContent(last.x, last.y)) {
        if (!box || !container) return

        const x1 = Math.min(start.x, pos.x)
        const y1 = Math.min(start.y, pos.y)
        const x2 = Math.max(start.x, pos.x)
        const y2 = Math.max(start.y, pos.y)
        box.style.left = x1 + "px"
        box.style.top = y1 + "px"
        box.style.width = x2 - x1 + "px"
        box.style.height = y2 - y1 + "px"

        const nodeRect = node.getBoundingClientRect()
        const hits: SlideRef[] = []
        container.querySelectorAll<HTMLElement>(".grid > .main[data-slide-index]").forEach((tile) => {
            if (tile.dataset.showId !== showId) return
            const r = tile.getBoundingClientRect()
            const left = r.left - nodeRect.left + node.scrollLeft
            const top = r.top - nodeRect.top + node.scrollTop
            const right = left + r.width
            const bottom = top + r.height
            if (right < x1 || left > x2 || bottom < y1 || top > y2) return
            hits.push({ index: Number(tile.dataset.slideIndex), showId })
        })

        const merged = [...base]
        hits.forEach((hit) => {
            if (!merged.some((a) => a.index === hit.index)) merged.push(hit)
        })
        merged.sort((a, b) => a.index - b.index)

        if (merged.length) selected.set({ id: "slide", data: merged })
        else selected.set({ id: null, data: [] })
    }

    // keep scrolling while the pointer is held near the top/bottom edge
    function startAutoScroll() {
        stopAutoScroll()
        scrollTimer = setInterval(() => {
            const rect = node.getBoundingClientRect()
            let delta = 0
            if (last.y < rect.top + EDGE) delta = -Math.ceil((rect.top + EDGE - last.y) / 3)
            else if (last.y > rect.bottom - EDGE) delta = Math.ceil((last.y - (rect.bottom - EDGE)) / 3)
            if (!delta) return
            node.scrollTop += delta
            update()
        }, 30)
    }
    function stopAutoScroll() {
        if (scrollTimer) clearInterval(scrollTimer)
        scrollTimer = null
    }

    function up() {
        pointerDown = false
        stopAutoScroll()
        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", up)
        if (box) box.remove()
        box = null
        if (dragging) {
            // swallow the click that follows the drag so it doesn't clear the selection
            const swallow = (ev: MouseEvent) => {
                ev.stopPropagation()
                ev.preventDefault()
            }
            window.addEventListener("click", swallow, { capture: true, once: true })
            setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 50)
        }
        dragging = false
        container = null
    }

    node.addEventListener("mousedown", down)

    return {
        destroy() {
            node.removeEventListener("mousedown", down)
            up()
        }
    }
}
