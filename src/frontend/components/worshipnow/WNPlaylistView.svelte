<!-- WorshipNow: ProPresenter-style playlist view. Every item in the playlist is stacked in one scrolling list. -->
<script lang="ts">
    import { onMount, tick } from "svelte"
    import type { ProjectShowRef } from "../../../types/Projects"
    import { addSection } from "../../converters/project"
    import { activeProject, activeShow, loaded, outputs, projects, shows, showsCache, slidesOptions } from "../../stores"
    import { hasNewerUpdate } from "../../utils/common"
    import Icon from "../helpers/Icon.svelte"
    import { getActiveOutputs } from "../helpers/output"
    import Loader from "../main/Loader.svelte"
    import FocusItem from "../show/focus/FocusItem.svelte"
    import { getAllProjectItems } from "../show/focus/focus"
    import Slides from "../show/Slides.svelte"
    import Center from "../system/Center.svelte"
    import { selectPlaylistItem } from "./state"

    $: projectId = $activeProject || ""
    $: project = $projects[projectId]

    // only rebuild the list when items are added, removed or reordered
    let itemsList: ProjectShowRef[] = []
    $: itemsKey = (project?.shows || []).map((a) => `${a.id}|${a.type || ""}|${a.layout || ""}|${a.name || ""}|${(a as any).color || ""}`).join(",")
    $: if (itemsKey !== undefined) itemsList = project?.shows || []

    // wait until the app has loaded its show list before loading the playlist's presentations
    $: showIdsKey = Object.keys($shows).length
    $: listPromise = $loaded && showIdsKey >= 0 ? getAllProjectItems(itemsList) : new Promise<ProjectShowRef[]>(() => {})

    let listElem: HTMLElement | undefined

    // OUTPUT
    $: outputId = getActiveOutputs($outputs, true, true, true)[0] || ""
    $: outSlide = $outputs[outputId]?.out?.slide
    $: outBackground = $outputs[outputId]?.out?.background

    function isLiveItem(item: ProjectShowRef, index: number) {
        if ((item.type || "show") === "show") return !!outSlide && outSlide.id === item.id && (outSlide.projectIndex === undefined || outSlide.projectIndex === index)
        return !!outBackground && (outBackground.path === item.id || outBackground.id === item.id)
    }

    // SCROLLING
    // keep the selected presentation visible when it is picked in the sidebar
    let lastScrolledIndex = -1
    $: if ($activeShow?.index !== undefined && $activeShow.index !== lastScrolledIndex) scrollToItem($activeShow.index)
    async function scrollToItem(index: number) {
        lastScrolledIndex = index
        await tick()
        const elem = listElem?.querySelector(`[data-item-index="${index}"]`) as HTMLElement | null
        const scroller = listElem?.closest(".center") as HTMLElement | null
        if (!elem || !scroller) return
        const top = elem.offsetTop - (listElem?.offsetTop || 0)
        const visible = top >= scroller.scrollTop && top < scroller.scrollTop + scroller.clientHeight - 120
        if (!visible) scroller.scrollTo({ top: Math.max(0, top - 8), behavior: "smooth" })
    }

    // follow the live slide (arrow keys / space)
    $: if (outSlide) followLiveSlide()
    async function followLiveSlide() {
        if (await hasNewerUpdate("WN_PLAYLIST_FOLLOW", 30)) return
        const scroller = listElem?.closest(".center") as HTMLElement | null
        if (!listElem || !scroller || outSlide?.index === undefined) return
        const itemIndex = outSlide.projectIndex ?? itemsList.findIndex((a) => a.id === outSlide?.id)
        const itemElem = listElem.querySelector(`[data-item-index="${itemIndex}"]`) as HTMLElement | null
        const slideElem = itemElem?.querySelector(".grid")?.children[outSlide.index] as HTMLElement | undefined
        if (!slideElem) return
        const sRect = slideElem.getBoundingClientRect()
        const cRect = scroller.getBoundingClientRect()
        if (sRect.top >= cRect.top + 10 && sRect.bottom <= cRect.bottom - 10) return
        scroller.scrollBy({ top: sRect.top - cRect.top - 60, behavior: "smooth" })
    }

    function itemName(item: any) {
        return item.name || ""
    }

    function layoutName(item: ProjectShowRef) {
        const show = $showsCache[item.id]
        const layoutId = item.layout || show?.settings?.activeLayout
        const layouts = show?.layouts || {}
        if (Object.keys(layouts).length < 2) return ""
        return layouts[layoutId || ""]?.name || ""
    }

    // ZOOM (thumbnail size), like ProPresenter's slider: more to the right = bigger slides
    const MIN_COLS = 2
    const MAX_COLS = 10
    $: zoom = MAX_COLS + MIN_COLS - ($slidesOptions.columns || 4)
    function setZoom(e: Event) {
        const value = Number((e.target as HTMLInputElement).value)
        slidesOptions.update((a) => ({ ...a, columns: MAX_COLS + MIN_COLS - value }))
    }
    function setMode(mode: "grid" | "list" | "lyrics") {
        slidesOptions.update((a) => ({ ...a, mode }))
    }

    onMount(() => {
        if ($activeShow?.index !== undefined) scrollToItem($activeShow.index)
    })
</script>

<div class="wn-playlist">
    {#await listPromise}
        <Center><Loader /></Center>
    {:then list}
        {#if list.length}
            <div class="list" bind:this={listElem}>
                {#each list as item, i (item.id + "_" + i)}
                    {@const type = item.type || "show"}
                    {@const isSelected = $activeShow?.index === i}
                    {@const hasCategoryIcon = type === "show" && !!item.icon && item.icon !== "noIcon" && item.icon !== "show"}

                    {#if type === "section"}
                        <div class="section context #project_section" data-item-index={i} role="none" on:click={() => selectPlaylistItem(i)} style="--section-color: {item.color || '#489bc9'};">
                            <span class="title">{item.name || "Header"}</span>
                            {#if item.notes}<span class="notes">{item.notes}</span>{/if}
                        </div>
                    {:else}
                        <div class="item" class:selected={isSelected} class:live={isLiveItem(item, i)} data-item-index={i} role="none" on:mousedown={() => selectPlaylistItem(i)}>
                            <div class="item-header">
                                <span class="icon"><Icon id={(hasCategoryIcon ? item.icon : type === "show" ? "showIcon" : item.icon) || "noIcon"} custom={hasCategoryIcon} size={0.95} white /></span>
                                <span class="name">{itemName(item)}</span>
                                {#if type === "show" && layoutName(item)}
                                    <span class="layout"><Icon id="layout" size={0.8} white />{layoutName(item)}</span>
                                {/if}
                            </div>

                            <div class="item-content">
                                {#if type === "show"}
                                    <Slides showId={item.id} layout={item.layout} projectIndex={i} embedded />
                                {:else}
                                    <FocusItem show={{ ...item, index: i }} />
                                {/if}
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
        {:else}
            <Center faded>
                <p style="font-size: 1.4em;margin-bottom: 6px;">This playlist is empty</p>
                <p style="opacity: 0.7;">Drag presentations here from the library, or drop media files.</p>
            </Center>
        {/if}
    {/await}
</div>

<div class="bottom-bar">
    <div class="left">
        <button class="bbtn" data-title="Add header" on:click={addSection}><Icon id="add" size={1} white /></button>
    </div>
    <div class="right">
        <button class="bbtn" class:active={$slidesOptions.mode === "grid"} data-title="Grid view" on:click={() => setMode("grid")}><Icon id="grid" size={1} white /></button>
        <button class="bbtn" class:active={$slidesOptions.mode === "lyrics"} data-title="Text view" on:click={() => setMode("lyrics")}><Icon id="text" size={1} white /></button>
        <button class="bbtn" class:active={$slidesOptions.mode === "list"} data-title="List view" on:click={() => setMode("list")}><Icon id="list" size={1} white /></button>
        <input class="zoom" type="range" min={MIN_COLS} max={MAX_COLS} step="1" value={zoom} on:input={setZoom} data-title="Slide size" />
    </div>
</div>

<style>
    .wn-playlist {
        /* grow with the content (never shrink to the window), so the bottom bar stays pinned to the bottom */
        flex: 1 0 auto;
        min-height: calc(100% - 34px);
        padding-bottom: 40px;
        background-color: #1e1e1e;
    }

    .list {
        display: flex;
        flex-direction: column;
    }

    /* playlist header ("Music", "PreShow") */
    .section {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 7px 12px;
        background-color: var(--section-color);
        color: #fff;
        cursor: pointer;
        text-shadow: 0 1px 1px rgb(0 0 0 / 0.25);
    }
    .section .title {
        font-size: 1.35em;
        font-weight: 700;
    }
    .section .notes {
        opacity: 0.85;
        font-size: 0.9em;
    }

    .item {
        border-left: 3px solid transparent;
    }
    .item.selected {
        border-left-color: #2f7cf6;
    }

    .item-header {
        position: sticky;
        top: 0;
        z-index: 5;

        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background-color: #121212;
        border-bottom: 1px solid #000;
        font-size: 0.98em;
    }
    .item.selected .item-header {
        background-color: #16243a;
    }
    .item-header .icon {
        display: flex;
        opacity: 0.85;
    }
    .item-header .name {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .item-header .layout {
        display: flex;
        align-items: center;
        gap: 4px;
        opacity: 0.6;
        font-size: 0.88em;
    }

    .item-content {
        padding: 6px 6px 10px;
    }
    .item-content :global(.grid.embedded) {
        padding: 0;
    }

    .bottom-bar {
        position: sticky;
        bottom: 0;
        z-index: 10;

        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 34px;
        padding: 0 8px;
        background-color: #1e1e1e;
        border-top: 1px solid #2c2c2c;
    }
    .bottom-bar .left,
    .bottom-bar .right {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .bbtn {
        display: flex;
        align-items: center;
        padding: 4px 5px;
        background: transparent;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        opacity: 0.65;
    }
    .bbtn:hover {
        opacity: 1;
        background-color: rgb(255 255 255 / 0.08);
    }
    .bbtn.active {
        opacity: 1;
    }
    .bbtn.active :global(svg) {
        fill: #2f7cf6;
    }

    .zoom {
        width: 90px;
        margin-left: 8px;
        accent-color: #8f8f8f;
    }
</style>
