<!-- WorshipNow: ProPresenter-style right column. Output preview with clear strip on top, tabbed bins below. -->
<script lang="ts">
    import { activeShow, drawerTabsData, focusMode } from "../../stores"
    import Audio from "../drawer/audio/Audio.svelte"
    import Actions from "../drawer/pages/Actions.svelte"
    import Overlays from "../drawer/pages/Overlays.svelte"
    import Timers from "../drawer/timers/Timers.svelte"
    import Icon from "../helpers/Icon.svelte"
    import Preview from "../output/preview/Preview.svelte"
    import ShowTools from "../show/ShowTools.svelte"
    import WNClearStrip from "./WNClearStrip.svelte"

    const tabs = [
        { id: "audio", icon: "music", title: "Audio" },
        { id: "timers", icon: "timer", title: "Timers" },
        { id: "props", icon: "overlays", title: "Props" },
        { id: "macros", icon: "actions", title: "Macros" },
        { id: "show", icon: "groups", title: "Groups, notes & info for the selected presentation" }
    ]
    let activeTab = "audio"
    let filter = ""

    $: audioSubTab = $drawerTabsData.audio?.activeSubTab || "all"
    $: overlaysSubTab = $drawerTabsData.overlays?.activeSubTab || "all"
    $: isShow = !!$activeShow && ($activeShow.type || "show") === "show"
</script>

<div class="wn-right">
    <div class="preview-row">
        <div class="preview"><Preview /></div>
        <WNClearStrip />
    </div>

    <div class="tabbar">
        {#each tabs as tab}
            <button class="tab" class:active={activeTab === tab.id} data-title={tab.title} on:click={() => (activeTab = tab.id)}>
                <Icon id={tab.icon} size={1.15} white />
            </button>
        {/each}
    </div>

    <div class="bin-header">
        <span>{tabs.find((a) => a.id === activeTab)?.title.split(",")[0]}</span>
    </div>

    <div class="bin">
        {#if activeTab === "audio"}
            <Audio active={audioSubTab} searchValue={filter} />
        {:else if activeTab === "timers"}
            <Timers searchValue={filter} />
        {:else if activeTab === "props"}
            <Overlays active={overlaysSubTab} searchValue={filter} />
        {:else if activeTab === "macros"}
            <Actions searchValue={filter} />
        {:else if activeTab === "show"}
            {#if isShow && !$focusMode}
                <ShowTools />
            {:else}
                <p class="empty">Select a presentation to see its groups and notes.</p>
            {/if}
        {/if}
    </div>

    {#if activeTab !== "show"}
        <div class="filter">
            <Icon id="filter" size={0.85} white />
            <input type="text" placeholder="Filter" bind:value={filter} />
        </div>
    {/if}
</div>

<style>
    .wn-right {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background-color: #2f2f2f;
        overflow: hidden;
    }

    .preview-row {
        display: flex;
        border-bottom: 1px solid #1a1a1a;
        flex-shrink: 0;
        max-height: 62%;
    }
    .preview {
        flex: 1;
        min-width: 0;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
    }

    .tabbar {
        display: flex;
        background-color: #555555;
        border-bottom: 1px solid #1a1a1a;
        flex-shrink: 0;
    }
    .tab {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 30px;
        background: transparent;
        border: none;
        border-right: 1px solid #484848;
        cursor: pointer;
    }
    .tab:last-child {
        border-right: none;
    }
    .tab :global(svg) {
        fill: #e6e6e6;
    }
    .tab:hover:not(.active) {
        background-color: rgb(255 255 255 / 0.08);
    }
    .tab.active {
        background-color: #047aff;
    }
    .tab.active :global(svg) {
        fill: #ffffff;
    }

    .bin-header {
        padding: 5px 10px 3px;
        background-color: #464646;
        font-size: 0.75em;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #b4b4b4;
        flex-shrink: 0;
    }

    .bin {
        position: relative;
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        background-color: #232323;
    }
    .empty {
        padding: 14px;
        opacity: 0.5;
        font-style: italic;
    }

    .filter {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 6px;
        padding: 3px 8px;
        background-color: #3c3c3b;
        border: 1px solid #2a2a2a;
        border-radius: 5px;
        flex-shrink: 0;
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
