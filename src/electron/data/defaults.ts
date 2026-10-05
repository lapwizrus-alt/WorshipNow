import type { SaveListSettings, SaveListSyncedSettings } from "../../types/Save"

export const defaultConfig = { loaded: false, maximized: true, bounds: { width: 800, height: 600, x: 0, y: 0 }, dataPath: null, disableHardwareAcceleration: null, graphicsDevice: null }

// WorshipNow: distinct, ProPresenter-style group colors (solid label bars)
export const defaultGroups = {
    break: { name: "break", default: true, color: "#5a5a5a" },
    bridge: { name: "bridge", default: true, color: "#6d1fa6", shortcut: "B" },
    chorus: { name: "chorus", default: true, color: "#b30c48", shortcut: "C" },
    intro: { name: "intro", default: true, color: "#0a8a8a" },
    outro: { name: "outro", default: true, color: "#4f5b66" },
    pre_chorus: { name: "pre_chorus", default: true, color: "#c7660b" },
    tag: { name: "tag", default: true, color: "#2a8c55" },
    verse: { name: "verse", default: true, color: "#0e6bb3", shortcut: "V" }
}

export const defaultSettings: { [key in SaveListSettings]: any } = {
    initialized: false,
    outLocked: false,
    outputs: {
        default: {
            enabled: true,
            active: true,
            name: "Primary",
            color: "#F5A623",
            bounds: { x: 0, y: 0, width: 1920, height: 1080 },
            screen: null,
            style: "default",
            show: {}
        }
    },
    sorted: {},
    openedFolders: ["default"],
    activeProject: null,
    alertUpdates: true,
    autoOutput: false,
    autosave: "15min",
    timeFormat: "24",
    remotePassword: "",
    ports: { remote: 5510, stage: 5511 },
    disabledServers: {},
    serverData: {},
    maxConnections: 10,
    mediaFolders: {},
    audioFolders: {},
    resized: {
        leftPanel: 230, // WorshipNow: narrow library/playlist column
        rightPanel: 440, // WorshipNow: wide preview column
        leftPanelDrawer: 290,
        rightPanelDrawer: 290
    },
    slidesOptions: { columns: 4, mode: "grid" },
    mediaOptions: { columns: 5, mode: "grid" },
    drawerTabsData: {},
    drawer: { height: 300, stored: null },
    language: null,
    customFonts: [],
    labelsDisabled: false,
    groupNumbers: true,
    fullColors: true, // WorshipNow: ProPresenter-style solid group label bars
    formatNewShow: false,
    lockedOverlays: {},
    activeScenes: {},
    splitLines: 0,
    theme: "default",
    transitionData: {
        text: { type: "fade", duration: 500, easing: "sine" },
        media: { type: "fade", duration: 800, easing: "sine" }
    },
    audioRouting: {},
    audioChannelsData: {},
    cloudSyncData: {},
    driveData: { mainFolderId: null, disabled: false, initializeMethod: null, disableUpload: false },
    calendarAddShow: "",
    metronome: {},
    audioEffects: {},
    audioEffectPresets: {},
    effectsLibrary: [],
    special: {},
    timeline: {},
    timecode: {},
    contentProviderData: {
        planningcenter: {
            localAlways: false
        },
        churchApps: {
            syncCategories: ["song"]
        }
    },
    obsData: {},
    ai: {}
}

export const defaultSyncedSettings: { [key in SaveListSyncedSettings]: any } = {
    categories: {
        song: { name: "category.song", icon: "song", default: true },
        presentation: { name: "category.presentation", icon: "presentation", default: true }
    },
    drawSettings: {},
    overlayCategories: {
        offers: { name: "category.offers", icon: "cash", default: true },
        notice: { name: "category.notice", icon: "info", default: true },
        visuals: { name: "category.visuals", icon: "star", default: true }
    },
    templateCategories: {
        song: { name: "category.song", icon: "song", default: true },
        presentation: { name: "category.presentation", icon: "presentation", default: true },
        scripture: { name: "category.scripture", icon: "scripture", default: true }
    },
    styles: {},
    profiles: {},
    timers: {
        default: { name: "05:00", type: "counter", start: 300, end: 0 }
    },
    variables: {
        default: { name: "Counter", type: "number" }
    },
    scenes: {},
    interactions: {},
    audioStreams: {},
    audioPlaylists: {},
    scriptures: {
        kjv: {
            name: "King James (Authorised) Version",
            api: true,
            id: "de4e12af7f28f599-02",
            copyright: "PUBLIC DOMAIN except in the United Kingdom, where a Crown Copyright applies to printing the KJV. See http://www.cambridge.org/about-us/who-we-are/queens-printers-patent"
        },
        asv: { name: "The Holy Bible, American Standard Version", api: true, id: "06125adad2d5898a-01", copyright: "PUBLIC DOMAIN" },
        web: { name: "World English Bible", api: true, id: "9879dbb7cfe39e4d-04", copyright: "PUBLIC DOMAIN" },
        wmb: { name: "World Messianic Bible", api: true, id: "f72b840c855f362c-04", copyright: "PUBLIC DOMAIN" },
        bsb: {
            name: "Berean Study Bible",
            api: true,
            id: "bba9f40183526463-01",
            copyright: "The Holy Bible, Berean Standard Bible, BSB is produced in cooperation with Bible Hub, Discovery Bible, OpenBible.com, and the Berean Bible Translation Committee. This text of God's Word has been dedicated to the public domain"
        }
    },
    scriptureSettings: {
        template: "scripture",
        versesPerSlide: 3,
        verseNumbers: true,
        showVersion: false,
        showVerse: true,
        referenceDivider: ":"
    },
    groups: defaultGroups,
    midiIn: {},
    emitters: {},
    playerVideos: {
        chosen: { name: "The Chosen Trailer", type: "youtube", id: "X-AJdKty74M" },
        story: { name: "The Jesus Story", type: "youtube", id: "2Yvs-Pz8KK0" },
        legacy: { name: "The Legacy of Adam", type: "youtube", id: "aPgbA6rVhWs" },
        gospel: { name: "The Gospel Film", type: "youtube", id: "mIeRU12STNw" },
        jesus: { name: "Jesus, Only Jesus", type: "vimeo", id: "426363743" },
        messiah: { name: "Messiah", type: "vimeo", id: "144160599" }
    },
    videoMarkers: {},
    calendars: {},
    mediaTags: {},
    playerTags: {},
    actionTags: {},
    variableTags: {},
    timerTags: {},
    customizedIcons: { disabled: [], svg: [] },
    companion: {},
    globalTags: {},
    globalRegexes: {},
    customMetadata: { disabled: [], custom: [] },
    effects: {},
    deletedDefaults: {},
    syncedOutputs: {}
}
