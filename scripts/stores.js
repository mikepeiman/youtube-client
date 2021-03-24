import { writable } from 'svelte/store'

let videosList = writable([])
let playlistsList = writable([])
let channelDetails = writable({})
let videoDetails = writable({})
let channelName = writable({})
let currentDisplayContext = writable("")
let channelId = writable("")
let videoId = writable("")
let uploadsId = writable("")
let playlistId = writable("")

export const storeVideosList = {
    subscribe: videosList.subscribe,
    set: val => {
        localStorage.setItem("videosList", JSON.stringify(val))
    }
}

export const storePlaylistsList = {
    subscribe: playlistsList.subscribe,
    set: val => {
        localStorage.setItem("playlistsList", JSON.stringify(val))
    }
}

export const storeChannelDetails = {
    subscribe: channelDetails.subscribe,
    set: val => {
        localStorage.setItem("channelDetails", JSON.stringify(val))
    }
}

export const storeVideoDetails = {
    subscribe: videoDetails.subscribe,
    set: val => {
        localStorage.setItem("videoDetails", JSON.stringify(val))
    }
}

export const storeCurrentDisplayContext = {
    subscribe: currentDisplayContext.subscribe,
    set: val => {
        localStorage.setItem("currentDisplayContext", JSON.stringify(val))
        currentDisplayContext.set(val)
    }
}

export const storeChannelName = {
    subscribe: channelName.subscribe,
    set: val => {
        localStorage.setItem("channelName", JSON.stringify(val))
    }
}


export const storeChannelId = {
    subscribe: channelId.subscribe,
    set: val => {
        localStorage.setItem("channelId", JSON.stringify(val))
        channelId.set(val)
    }
}

export const storeUploadsId = {
    subscribe: uploadsId.subscribe,
    set: val => {
        localStorage.setItem("uploadsId", JSON.stringify(val))
        uploadsId.set(val)
    }
}

export const storePlaylistId = {
    subscribe: playlistId.subscribe,
    set: val => {
        localStorage.setItem("playlistId", JSON.stringify(val))
        playlistId.set(val)
    }
}

export const storeVideoId = {
    subscribe: videoId.subscribe,
    set: val => {
        localStorage.setItem("videoId", JSON.stringify(val))
        videoId.set(val)
    }
}


