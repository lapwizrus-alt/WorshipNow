// WorshipNow: shared state for the ProPresenter-style main window.
import { get, writable, type Writable } from "svelte/store"
import { activePage, activeProject, activeShow, projects } from "../../stores"
import { openProjectItem } from "../show/project"

/** What the left "Library / Playlist" column has selected. */
export type SidebarSelection = { type: "library"; id: string } | { type: "playlist"; id: string }
export const wnSidebarSelection: Writable<SidebarSelection | null> = writable(null)

/** Filter text typed into the left column filter box. */
export const wnSidebarFilter: Writable<string> = writable("")

/**
 * The center area shows the whole playlist stacked (ProPresenter's playlist view)
 * whenever the active item came from the open playlist.
 */
export function isPlaylistViewActive(): boolean {
    if (get(activePage) !== "show") return false
    const projectId = get(activeProject)
    if (!projectId || !get(projects)[projectId]) return false
    const show = get(activeShow)
    if (!show) return true
    return show.index !== undefined
}

/** Select a playlist item without opening a separate view (keeps the stacked playlist). */
export function selectPlaylistItem(index: number) {
    const projectId = get(activeProject)
    const item = get(projects)[projectId || ""]?.shows?.[index]
    if (!item) return
    const current = get(activeShow)
    if (current?.id === item.id && current?.index === index) return
    openProjectItem(projectId || "", index)
}
