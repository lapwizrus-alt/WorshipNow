<!-- WorshipNow: ProPresenter-style left column. Libraries and playlists on top, the selected one's items below. -->
<script lang="ts">
    import { onMount } from "svelte"
    import { activeProject, activeShow, categories, folders, projects, projectView, shows } from "../../stores"
    import { addSection } from "../../converters/project"
    import { history } from "../helpers/history"
    import Icon from "../helpers/Icon.svelte"
    import { sortByName } from "../helpers/array"
    import ShowButton from "../inputs/ShowButton.svelte"
    import ProjectContentList from "../show/ProjectContentList.svelte"
    import SelectElem from "../system/SelectElem.svelte"
    import { translateText } from "../../utils/language"
    import { wnSidebarFilter, wnSidebarSelection } from "./state"
    import { activePopup } from "../../stores"

    // keep the left selection in sync with the active project
    // (until the user picks a library, reopen the last used playlist like ProPresenter does)
    let userPickedLibrary = false
    onMount(() => {
        if (!$wnSidebarSelection) wnSidebarSelection.set($activeProject && $projects[$activeProject] ? { type: "playlist", id: $activeProject } : { type: "library", id: "all" })
    })
    $: if ($activeProject && $projects[$activeProject] && !userPickedLibrary && !($wnSidebarSelection?.type === "playlist" && $wnSidebarSelection.id === $activeProject)) {
        wnSidebarSelection.set({ type: "playlist", id: $activeProject })
    }

    // LIBRARIES (show categories)
    $: libraries = [
        { id: "all", name: "All Presentations", icon: "all", custom: false },
        ...sortByName(
            Object.entries($categories)
                .filter(([_, c]) => !c.isArchive)
                .map(([id, c]) => ({ id, name: translateText(c.name), icon: c.icon || "noIcon", custom: true }))
        )
    ]

    function selectLibrary(id: string) {
        userPickedLibrary = true
        wnSidebarSelection.set({ type: "library", id })
        wnSidebarFilter.set("")
    }

    // PLAYLISTS (projects, in folders)
    let openFolders: { [key: string]: boolean } = {}
    type Row = { id: string; name: string; depth: number; folder: boolean }
    $: playlistRows = buildTree($folders, $projects, openFolders)
    function buildTree(_f: any, _p: any, _o: any): Row[] {
        const rows: Row[] = []
        const add = (parent: string, depth: number) => {
            const subFolders = sortByName(
                Object.entries($folders)
                    .filter(([_, f]) => !f.deleted && (f.parent || "/") === parent)
                    .map(([id, f]) => ({ id, ...f }))
            )
            const subProjects = sortByName(
                Object.entries($projects)
                    .filter(([_, p]) => !p.deleted && !p.archived && (p.parent || "/") === parent)
                    .map(([id, p]) => ({ id, ...p }))
            )
            subFolders.forEach((f: any) => {
                rows.push({ id: f.id, name: f.name || "Folder", depth, folder: true })
                if (openFolders[f.id]) add(f.id, depth + 1)
            })
            subProjects.forEach((p: any) => rows.push({ id: p.id, name: p.name || translateText("main.unnamed"), depth, folder: false }))
        }
        add("/", 0)
        // projects whose folder no longer exists
        Object.entries($projects).forEach(([id, p]) => {
            if (!p.deleted && !p.archived && p.parent !== "/" && p.parent && !$folders[p.parent] && !rows.find((r) => r.id === id)) rows.push({ id, name: p.name, depth: 0, folder: false })
        })
        return rows
    }

    function selectPlaylist(id: string) {
        userPickedLibrary = false
        wnSidebarSelection.set({ type: "playlist", id })
        wnSidebarFilter.set("")
        projectView.set(false)
        if ($activeProject !== id) {
            activeProject.set(id)
            // show the whole playlist in the center
            activeShow.set(null)
        }
    }

    function newPlaylist() {
        history({ id: "UPDATE", newData: { replace: { parent: "/" } }, location: { page: "show", id: "project" } })
        setTimeout(() => {
            if ($activeProject) wnSidebarSelection.set({ type: "playlist", id: $activeProject })
        }, 50)
    }

    function newPresentation() {
        activePopup.set("show")
    }

    // ITEMS (bottom list)
    $: selection = $wnSidebarSelection
    $: isPlaylist = selection?.type === "playlist" && !!$projects[selection.id]
    $: playlist = isPlaylist ? $projects[selection?.id || ""] : null
    $: filter = $wnSidebarFilter.toLowerCase().trim()

    $: libraryShows = selection?.type === "library" ? sortByName(Object.entries($shows).filter(([_, s]) => !s.private && (selection?.id === "all" ? !$categories[s.category || ""]?.isArchive : s.category === selection?.id)).map(([id, s]) => ({ id, ...s }))) : []
    $: filteredLibraryShows = filter ? libraryShows.filter((s: any) => s.name?.toLowerCase().includes(filter)) : libraryShows

    $: itemCount = isPlaylist ? (playlist?.shows || []).filter((a) => a.type !== "section").length : filteredLibraryShows.length

    // top/bottom split
    let topHeight = 210
    let dragging = false
    let columnElem: HTMLElement
    function startDrag() {
        dragging = true
    }
    function drag(e: MouseEvent) {
        if (!dragging || !columnElem) return
        const rect = columnElem.getBoundingClientRect()
        topHeight = Math.max(80, Math.min(rect.height - 120, e.clientY - rect.top))
    }
</script>

<svelte:window on:mousemove={drag} on:mouseup={() => (dragging = false)} />

<div class="wn-left" bind:this={columnElem}>
    <div class="top" style="height: {topHeight}px;">
        <div class="header">
            <span>Library</span>
            <button class="hbtn" data-title="New presentation" on:click={newPresentation}><Icon id="add" size={0.9} white /></button>
        </div>
        {#each libraries as lib}
            <button class="row" class:selected={selection?.type === "library" && selection.id === lib.id} on:click={() => selectLibrary(lib.id)}>
                <span class="libicon"><Icon id={lib.icon} custom={lib.custom} size={0.85} white /></span>
                <span class="name">{lib.name}</span>
            </button>
        {/each}

        <div class="header" style="margin-top: 4px;">
            <span>Playlist</span>
            <button class="hbtn" data-title="New playlist" on:click={newPlaylist}><Icon id="add" size={0.9} white /></button>
        </div>
        {#each playlistRows as row}
            {#if row.folder}
                <button class="row context #folder" style="padding-left: {10 + row.depth * 14}px;" on:click={() => (openFolders = { ...openFolders, [row.id]: !openFolders[row.id] })}>
                    <span class="chev" class:open={openFolders[row.id]}><Icon id="arrow_right" size={0.75} white /></span>
                    <Icon id={openFolders[row.id] ? "folderOpen" : "folder"} size={0.85} white />
                    <span class="name">{row.name}</span>
                </button>
            {:else}
                <button class="row context #project_button" style="padding-left: {10 + row.depth * 14}px;" class:selected={selection?.type === "playlist" && selection.id === row.id} on:click={() => selectPlaylist(row.id)}>
                    <span class="plicon"><Icon id="playlist" size={0.85} white /></span>
                    <span class="name">{row.name}</span>
                </button>
            {/if}
        {/each}
        {#if !playlistRows.length}
            <p class="empty">No playlists yet</p>
        {/if}
    </div>

    <div class="splitter" role="none" on:mousedown|preventDefault={startDrag} />

    <div class="items-header">
        <span>{itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"}</span>
        {#if isPlaylist}
            <button class="hbtn" data-title="Add header" on:click={addSection}><Icon id="add" size={0.9} white /></button>
        {/if}
    </div>

    <div class="items">
        {#if isPlaylist}
            {#key selection?.id}
                <ProjectContentList tree={[]} />
            {/key}
        {:else}
            <div class="library-list">
                {#each filteredLibraryShows as show (show.id)}
                    <SelectElem id="show_drawer" data={{ id: show.id }} shiftRange={filteredLibraryShows} draggable>
                        <ShowButton id={show.id} {show} class="#drawer_show_button" icon />
                    </SelectElem>
                {/each}
                {#if !filteredLibraryShows.length}
                    <p class="empty">{filter ? "No matches" : "This library is empty"}</p>
                {/if}
            </div>
        {/if}
    </div>

    <div class="filter">
        <Icon id="filter" size={0.85} white />
        <input type="text" placeholder="Filter" bind:value={$wnSidebarFilter} />
    </div>
</div>

<style>
    .wn-left {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background-color: #464646;
        font-size: 0.92em;
        overflow: hidden;
    }

    .top {
        overflow-y: auto;
        overflow-x: hidden;
        padding-bottom: 6px;
        flex-shrink: 0;
    }

    .header,
    .items-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px 3px 10px;
        font-size: 0.82em;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #b4b4b4;
    }
    .items-header {
        background-color: #232323;
        border-top: 1px solid #1a1a1a;
        border-bottom: 1px solid #1a1a1a;
        padding: 5px 8px 5px 10px;
        color: #d0d0d0;
        font-weight: 600;
        letter-spacing: 0.02em;
    }

    .hbtn {
        display: flex;
        align-items: center;
        background: transparent;
        border: none;
        padding: 2px 4px;
        border-radius: 3px;
        cursor: pointer;
        opacity: 0.8;
    }
    .hbtn:hover {
        background-color: rgb(255 255 255 / 0.1);
        opacity: 1;
    }

    .row {
        display: flex;
        align-items: center;
        gap: 7px;
        width: calc(100% - 8px);
        margin: 0 4px;
        padding: 3px 10px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 3px;
        color: #ececec;
        font-family: inherit;
        font-size: inherit;
        text-align: left;
        cursor: pointer;
    }
    .row:hover {
        background-color: rgb(255 255 255 / 0.06);
    }
    .row.selected {
        background-color: #5a5a5a;
        border-color: #6e6e6e;
    }
    .row .name {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .libicon,
    .plicon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 3px;
    }
    .libicon {
        background-color: #e8742a;
    }
    .plicon {
        background-color: #3d8fe0;
    }
    .chev {
        display: flex;
        transition: transform 0.1s;
    }
    .chev.open {
        transform: rotate(90deg);
    }

    .splitter {
        height: 4px;
        flex-shrink: 0;
        cursor: ns-resize;
        background-color: #3a3a3a;
    }

    .items {
        flex: 1;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        background-color: #464646;
    }
    .library-list {
        overflow-y: auto;
        height: 100%;
    }

    .empty {
        padding: 10px 14px;
        opacity: 0.5;
        font-style: italic;
    }

    .filter {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 6px;
        padding: 3px 8px;
        background-color: #3a3a3a;
        border: 1px solid #2c2c2c;
        border-radius: 5px;
    }
    .filter :global(svg) {
        opacity: 0.6;
    }
    .filter input {
        flex: 1;
        min-width: 0;
        background: transparent;
        border: none;
        outline: none;
        color: #ececec;
        font-family: inherit;
        font-size: inherit;
    }
    .filter input::placeholder {
        color: #8c8c8c;
    }
</style>
