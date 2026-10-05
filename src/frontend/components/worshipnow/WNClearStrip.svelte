<!-- WorshipNow: ProPresenter-style vertical "clear layer" strip next to the output preview. -->
<script lang="ts">
    import { clearAudio } from "../../audio/audioFading"
    import { activeTimers, outLocked, outputs, playingAudio, playingMetronome, timelineRecordingAction } from "../../stores"
    import Icon from "../helpers/Icon.svelte"
    import { isOutCleared } from "../helpers/output"
    import { clearAll, clearBackground, clearOverlays, clearSlide, clearTimers } from "../output/clear"

    $: audioActive = !!Object.keys($playingAudio).length || !!$playingMetronome
    $: slideActive = !isOutCleared("slide", $outputs)
    $: mediaActive = !isOutCleared("background", $outputs)
    $: propsActive = !isOutCleared("overlays", $outputs, true) || !isOutCleared("effects", $outputs, true)
    $: timersActive = !isOutCleared("transition", $outputs) || !!Object.keys($activeTimers || {}).length
    $: anyActive = audioActive || slideActive || mediaActive || propsActive

    // order and shortcuts match ProPresenter's defaults
    $: layers = [
        { id: "audio", icon: "music", label: "Clear Audio", key: "F5", active: audioActive, clear: () => clearAudio("", { clearPlaylist: true, clearMicrophones: true, commonClear: true }) },
        { id: "timers", icon: "timer", label: "Clear Timers", key: "", active: timersActive, clear: () => clearTimers() },
        { id: "props", icon: "overlays", label: "Clear Props", key: "F4", active: propsActive, clear: () => clearOverlays() },
        { id: "slide", icon: "text", label: "Clear Slide", key: "F2", active: slideActive, clear: () => clearSlide() },
        { id: "media", icon: "image", label: "Clear Media", key: "F3", active: mediaActive, clear: () => clearBackground() }
    ]

    function clear(layer: (typeof layers)[number]) {
        if ($outLocked) return
        layer.clear()
        timelineRecordingAction.set({ id: "clear_" + (layer.id === "props" ? "overlays" : layer.id === "media" ? "background" : layer.id) })
    }
</script>

<div class="strip">
    <button class="clear-all" class:active={anyActive} disabled={$outLocked} data-title="Clear All [F1 / Esc]" on:click={() => clearAll(true)}>
        <Icon id="close" size={1.05} white />
    </button>

    {#each layers as layer}
        <button class="layer" class:active={layer.active} disabled={$outLocked} data-title="{layer.label}{layer.key ? ` [${layer.key}]` : ''}" on:click={() => clear(layer)}>
            <Icon id={layer.icon} size={1.15} white />
        </button>
    {/each}
</div>

<style>
    .strip {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 46px;
        min-width: 46px;
        background-color: #2f2f2f;
        border-left: 1px solid #1a1a1a;
    }

    .layer {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        background: transparent;
        border: none;
        border-bottom: 1px solid #262626;
        cursor: pointer;
    }
    .layer :global(svg) {
        fill: #bdbdbd;
        opacity: 0.45;
    }
    .layer:hover:not(:disabled) {
        background-color: rgb(255 255 255 / 0.06);
    }
    .layer.active {
        background-color: #3a3a3a;
    }
    .layer.active :global(svg) {
        fill: #ffffff;
        opacity: 1;
    }
    .layer.active::after {
        content: "";
        position: absolute;
        left: 0;
        width: 3px;
        height: 40px;
        background-color: #f5a623;
    }
    .layer {
        position: relative;
    }

    /* the round "clear all" button sits on the preview's edge, like ProPresenter */
    .clear-all {
        position: absolute;
        top: 50px;
        left: -14px;
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: none;
        background-color: #e6e6e6;
        cursor: pointer;
        box-shadow: 0 1px 4px rgb(0 0 0 / 0.5);
    }
    .clear-all :global(svg) {
        fill: #1e1e1e !important;
    }
    .clear-all:not(.active) {
        opacity: 0.55;
    }
    .clear-all:hover:not(:disabled) {
        background-color: #ffffff;
        opacity: 1;
    }
    button:disabled {
        cursor: default;
    }
</style>
