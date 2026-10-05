<!-- WorshipNow: ProPresenter-style main toolbar (icon above label, grouped). -->
<script lang="ts">
    import { activeEdit, activePage, activeShow, editMode, os, outputs, outputState, quickSearchActive, saved, settingsTab, shows, activeDrawerTab, drawer } from "../../stores"
    import { openDrawer } from "../edit/scripts/edit"
    import Icon from "../helpers/Icon.svelte"
    import { toggleOutputs } from "../helpers/output"

    export let isWindows = false

    $: show = $shows[$activeShow?.id || ""]
    $: isShow = !!$activeShow && ($activeShow.type || "show") === "show"
    $: editDisabled = !$activeShow?.id || !!show?.locked

    // outputs
    $: audienceIds = Object.entries($outputs)
        .filter(([_, o]) => o.enabled && !o.stageOutput && !o.invisible)
        .map(([id]) => id)
    $: stageIds = Object.entries($outputs)
        .filter(([_, o]) => o.enabled && o.stageOutput && !o.invisible)
        .map(([id]) => id)
    $: audienceOn = audienceIds.some((id) => $outputState.find((a) => a.id === id)?.active)
    $: stageOn = stageIds.some((id) => $outputState.find((a) => a.id === id)?.active)

    function openSettings(tab = "") {
        if (tab) settingsTab.set(tab as any)
        activePage.set("settings")
    }

    function toggleAudience() {
        if (!audienceIds.length) return openSettings("display_settings")
        toggleOutputs(audienceIds, { state: !audienceOn })
    }
    function toggleStage() {
        if (!stageIds.length) return openSettings("display_settings")
        toggleOutputs(stageIds, { state: !stageOn })
    }

    function openEdit(mode: "default" | "text_edit" = "default") {
        if (editDisabled) return
        if (isShow && (!$activeEdit.showId || $activeEdit.showId !== $activeShow?.id || $activeEdit.id)) {
            activeEdit.set({ slide: $activeEdit.slide || 0, items: [], showId: $activeShow?.id })
        }
        editMode.set(mode)
        activePage.set("edit")
    }

    function bin(id: string) {
        // toggle the bottom bin like ProPresenter: clicking the open bin collapses it
        if ($activePage === "show" && $activeDrawerTab === id && $drawer.height > 40) {
            drawer.set({ height: 40, stored: $drawer.height })
            return
        }
        openDrawer(id)
    }

    $: reflowActive = $activePage === "edit" && $editMode === "text_edit"

    type Btn = { id: string; label: string; icon: string; active?: boolean; disabled?: boolean; title?: string; click: () => void }
    $: leftGroup = [
        { id: "search", label: "Search", icon: "search", title: "Search everything [Ctrl+G]", click: () => quickSearchActive.set(true) },
        { id: "text", label: "Text", icon: "text", title: "Edit the text of the selected presentation", disabled: editDisabled || !isShow, click: () => openEdit() },
        { id: "theme", label: "Theme", icon: "templates", title: "Themes (templates)", active: $activePage === "show" && $activeDrawerTab === "templates" && $drawer.height > 40, click: () => bin("templates") }
    ] as Btn[]
    $: middleGroup = [
        { id: "show", label: "Show", icon: "play", title: "Show mode [1]", active: $activePage === "show", click: () => activePage.set("show") },
        { id: "edit", label: "Edit", icon: "edit", title: "Edit mode [2]", active: $activePage === "edit" && !reflowActive, disabled: editDisabled, click: () => openEdit() },
        { id: "reflow", label: "Reflow", icon: "text_edit", title: "Reflow: edit all slide text as plain text", active: reflowActive, disabled: editDisabled || !isShow, click: () => openEdit("text_edit") },
        { id: "bible", label: "Bible", icon: "scripture", title: "Bible", active: $activePage === "show" && $activeDrawerTab === "scripture" && $drawer.height > 40, click: () => bin("scripture") },
        { id: "more", label: "More", icon: "more", title: "More", active: moreOpen || $activePage === "stage" || $activePage === "draw", click: () => (moreOpen = !moreOpen) }
    ] as Btn[]

    let moreOpen = false
    let moreLeft = 0
    $: moreItems = [
        { label: "Stage Display Layouts", icon: "stage", click: () => activePage.set("stage") },
        { label: "Draw on Output", icon: "draw", click: () => activePage.set("draw") },
        { label: "Calendar", icon: "calendar", click: () => bin("calendar") },
        { label: "Screen Configuration", icon: "display_settings", click: () => openSettings("display_settings") }
    ]
    $: rightGroup = [
        { id: "media", label: "Media", icon: "media", title: "Media bin", active: $activePage === "show" && $activeDrawerTab === "media" && $drawer.height > 40, click: () => bin("media") },
        { id: "props", label: "Props", icon: "overlays", title: "Props (overlays)", active: $activePage === "show" && $activeDrawerTab === "overlays" && $drawer.height > 40, click: () => bin("overlays") },
        { id: "macros", label: "Macros", icon: "functions", title: "Macros, timers & variables", active: $activePage === "show" && $activeDrawerTab === "functions" && $drawer.height > 40, click: () => bin("functions") }
    ] as Btn[]
</script>

<div class="toolbar" class:drag={!isWindows} class:mac={$os.platform === "darwin"}>
    <div class="group">
        {#each leftGroup as b}
            <button class="tool" class:active={b.active} disabled={b.disabled} data-title={b.title} on:click={b.click}>
                <Icon id={b.icon} size={1.35} white />
                <span>{b.label}</span>
            </button>
        {/each}
    </div>

    <div class="group">
        {#each middleGroup as b}
            <button class="tool" class:active={b.active} disabled={b.disabled} data-title={b.title} on:click={(e) => { if (b.id === "more") moreLeft = e.currentTarget.getBoundingClientRect().left; b.click() }}>
                <Icon id={b.icon} size={1.35} white />
                <span>{b.label}</span>
            </button>
        {/each}
    </div>

    <div class="spacer">
        <span class="appname">WorshipNow{#if !$saved}<span class="unsaved" data-title="Unsaved changes">•</span>{/if}</span>
    </div>

    <div class="group">
        {#each rightGroup as b}
            <button class="tool" class:active={b.active} disabled={b.disabled} data-title={b.title} on:click={b.click}>
                <Icon id={b.icon} size={1.35} white />
                <span>{b.label}</span>
            </button>
        {/each}
    </div>

    <div class="group">
        <button class="tool screen" data-title={audienceIds.length ? `${audienceOn ? "Turn off" : "Turn on"} audience screens [Ctrl+O]` : "No audience screen set up - open screen settings"} on:click={toggleAudience}>
            <span class="dot" class:on={audienceOn} class:none={!audienceIds.length} />
            <span>Audience</span>
        </button>
        <button class="tool screen" data-title={stageIds.length ? `${stageOn ? "Turn off" : "Turn on"} stage screens` : "No stage screen set up - open screen settings"} on:click={toggleStage}>
            <span class="dot" class:on={stageOn} class:none={!stageIds.length} />
            <span>Stage</span>
        </button>
    </div>

    <div class="group">
        <button class="tool" class:active={$activePage === "settings"} data-title="Settings [5]" on:click={() => openSettings()}>
            <Icon id="settings" size={1.35} white />
            <span>Settings</span>
        </button>
    </div>
</div>

{#if moreOpen}
    <div class="moreBackdrop" role="none" on:click={() => (moreOpen = false)} />
    <div class="moreMenu" style="left: {moreLeft}px;">
        {#each moreItems as item}
            <button
                on:click={() => {
                    moreOpen = false
                    item.click()
                }}
            >
                <Icon id={item.icon} size={1} white />
                <span>{item.label}</span>
            </button>
        {/each}
    </div>
{/if}

<style>
    .toolbar {
        position: relative;
        z-index: 30;
        display: flex;
        align-items: stretch;
        gap: 10px;
        height: 58px;
        min-height: 58px;
        padding: 0 10px;

        background: linear-gradient(#5a5a5e, #4e4e52);
        border-bottom: 1px solid #1a1a1a;
        user-select: none;
    }
    .toolbar.drag {
        -webkit-app-region: drag;
    }
    .toolbar.drag :global(button) {
        -webkit-app-region: no-drag;
    }
    /* leave room for the macOS traffic lights */
    .toolbar.mac {
        padding-left: 80px;
    }

    .group {
        display: flex;
        align-items: stretch;
        gap: 2px;
    }
    .group + .group::before {
        content: "";
        align-self: center;
        width: 1px;
        height: 30px;
        margin-right: 8px;
        background-color: rgb(0 0 0 / 0.25);
    }

    .spacer {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
    }
    .appname {
        font-size: 0.95em;
        font-weight: 600;
        color: #d2d2d4;
        letter-spacing: 0.02em;
        white-space: nowrap;
        overflow: hidden;
    }
    .unsaved {
        color: #f5a623;
        margin-left: 4px;
    }

    .tool {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        min-width: 50px;
        padding: 4px 6px;

        background: transparent;
        border: none;
        border-radius: 5px;
        color: #c9c9cc;
        font-family: inherit;
        font-size: 0.72em;
        cursor: pointer;
    }
    .tool :global(svg) {
        fill: #d8d8da;
        opacity: 0.9;
    }
    .tool:hover:not(:disabled) {
        background-color: rgb(255 255 255 / 0.08);
    }
    .tool:active:not(:disabled) {
        background-color: rgb(0 0 0 / 0.15);
    }
    .tool.active {
        color: #ffffff;
    }
    .tool.active :global(svg) {
        fill: #ffffff;
        opacity: 1;
    }
    .tool.active span {
        font-weight: 600;
    }
    .tool:disabled {
        opacity: 0.35;
        cursor: default;
    }

    /* Audience / Stage screen toggles */
    .dot {
        width: 17px;
        height: 17px;
        margin: 3px 0;
        border-radius: 50%;
        border: 2.5px solid #e5453a;
        background: transparent;
    }
    .dot.on {
        border-color: #34c759;
        background-color: #34c759;
        box-shadow: 0 0 6px rgb(52 199 89 / 0.6);
    }
    .dot.none {
        border-color: #8a8a8e;
        border-style: dashed;
    }

    .moreBackdrop {
        position: fixed;
        inset: 0;
        z-index: 199;
    }
    .moreMenu {
        position: fixed;
        top: 56px;
        z-index: 200;
        display: flex;
        flex-direction: column;
        min-width: 210px;
        padding: 4px;
        background-color: #3a3a3c;
        border: 1px solid #1f1f1f;
        border-radius: 6px;
        box-shadow: 0 6px 18px rgb(0 0 0 / 0.5);
    }
    .moreMenu button {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 10px;
        background: transparent;
        border: none;
        border-radius: 4px;
        color: #ececec;
        font-family: inherit;
        font-size: 0.9em;
        text-align: left;
        cursor: pointer;
    }
    .moreMenu button:hover {
        background-color: #2f7cf6;
    }

    @media screen and (max-width: 1100px) {
        .appname {
            display: none;
        }
    }
    @media screen and (max-width: 900px) {
        .tool span:not(.dot) {
            display: none;
        }
        .tool {
            min-width: 36px;
        }
    }
</style>
