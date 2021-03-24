import { writable } from 'svelte/store'

let videoItems = writable([])
let playlistItems = writable([])
let channelDetails = writable({})
let itemDetails = writable({})
let channelName = writable({})
let currentDisplayContext = writable("")

export const storeVideosList = {
    subscribe: videoItems.subscribe,
    set: val => {
        localStorage.setItem("videoItems", JSON.stringify(val))
    }
}

export const storePlaylistItems = {
    subscribe: playlistItems.subscribe,
    set: val => {
        localStorage.setItem("playlistItems", JSON.stringify(val))
    }
}

export const storeChannelDetails = {
    subscribe: channelDetails.subscribe,
    set: val => {
        localStorage.setItem("channelDetails", JSON.stringify(val))
    }
}

export const storeItemDetails = {
    subscribe: itemDetails.subscribe,
    set: val => {
        localStorage.setItem("itemDetails", JSON.stringify(val))
    }
}

export const storeChannelName = {
    subscribe: channelName.subscribe,
    set: val => {
        localStorage.setItem("channelName", JSON.stringify(val))
    }
}

export const storeCurrentDisplayContext = {
    subscribe: currentDisplayContext.subscribe,
    set: val => {
        localStorage.setItem("currentDisplayContext", JSON.stringify(val))
        currentDisplayContext.set(val)
    }
}
