<script>
    /**
     * Sample JavaScript code for youtube.channels.list
     * See instructions for running APIs Explorer code samples locally:
     * https://developers.google.com/explorer-help/guides/code_samples#javascript
     */

    import { onMount } from "svelte";
    import "smelte/src/tailwind.css";
    import Button from "smelte/src/components/Button";
    import Chip from "smelte/src/components/Chip";
    import TextField from "smelte/src/components/TextField";
    import ChannelDetails from "./ChannelDetails.svelte";
    import Video from "./Video.svelte";

    import {
        storeVideosList,
        storeChannelDetails,
        storePlaylistsList,
        storeVideoDetails,
        storeChannelName,
        storeCurrentDisplayContext,
        storeChannelId,
        storeUploadsId,
        storePlaylistId,
        storeVideoId,
    } from "../../scripts/stores.js";
    import { API_KEY } from "../../scripts/secret_keys.js";
    import { CLIENT_ID } from "../../scripts/secret_keys.js";
    import PlaylistItem from "./PlaylistItem.svelte";
    import Playlist from "./Playlist.svelte";
    // import colors from 'tailwindcss/colors'
    // let API_KEY = process.env.API_KEY;
    // let CLIENT_ID = process.env.CLIENT_ID;
    // export let API_KEY, CLIENT_ID
    console.log(
        `🚀 ~ file: YouTube_OAuth.svelte ~ line 25 ~ CLIENT_ID ${CLIENT_ID} ~ API_KEY`,
        API_KEY
    );

    let mounted = false,
        gapiLoaded = false;

    let forUsername = "";
    let channelName = "";
    $: currentDisplayContext = "default";
    // Options: "Channel Details", "Collection", "Playlist", "Video Details"
    let channelId = "";
    let videoId = "";
    $: channelDetails = {};
    $: videoDetails = {};
    let channelDescription = "";
    let channelThumbnails = {};
    $: nextPageToken = "";
    let pageInfo = {};
    $: playlistsList = lsget("playlistsList");
    $: videosList = [];
    let maxResults = 50;
    let videosListData = [];
    // let lookupPart = "snippet";
    let lookupPart = "contentDetails";
    $: uploadsId = "";
    $: playlistId = $storePlaylistId;
    let pagesOfResults = 0;
    let isAuthorized = false;

    onMount(() => {
        // console.log(`tailwind colors: `, colors)
        if (gapiLoaded) {
            console.log(`GAPI loaded`);
            // authenticate().then(loadClient)
            // gapi.load("client:auth2", function () {
            //     gapi.auth2.init({ client_id: CLIENT_ID });
            // });
            handleClientLoad();
        }
        loadDataFromLS();
    });

    storeVideosList.subscribe((val) => {
        console.log(
            `🚀 ~ file: YouTube_OAuth.svelte ~ storeVideosList ~ onMount ~ val`,
            val
        );
    });
    storeChannelName.subscribe((val) => {
        console.log(
            `🚀 ~ file: YouTube_OAuth.svelte ~ storeChannelName ~ onMount ~ val`,
            val
        );
    });
    storeChannelDetails.subscribe((val) => {
        console.log(
            `🚀 ~ file: YouTube_OAuth.svelte ~ storeChannelDetails ~ onMount ~ val`,
            val
        );
    });
    storeCurrentDisplayContext.subscribe((val) => {
        console.log(
            `🚀 ~ file: YouTube_OAuth.svelte ~ storeCurrentDisplayContext ~ onMount ~ val`,
            val
        );
        currentDisplayContext = val;
    });
    storeVideoDetails.subscribe((val) => {
        console.log(
            `🚀 ~ file: YouTube_OAuth.svelte ~ storeVideoDetails ~ onMount ~ val`,
            val
        );
    });

    function lsget(item) {
        let ls = localStorage.getItem(item);
        if (ls) {
            console.log(`💎⛏ item ls ${ls}`);
            return JSON.parse(ls);
        } else {
            return item;
        }
    }

    function loadDataFromLS() {
        channelName = lsget("channelName");
        channelDetails = lsget("channelDetails");
        videoDetails = lsget("videoDetails");
        videosList = lsget("videosList");
        // playlistsList = lsget("playlistsList");
        currentDisplayContext = lsget("currentDisplayContext");
        channelId = lsget("channelId");
        uploadsId = lsget("uploadsId");
        playlistId = lsget("playlistId");
        videoId = lsget("videoId");
    }

    function loadGapi() {
        mounted = true;
        gapiLoaded = true;
        handleClientLoad();
        // gapi.load("client:auth2", function () {
        //     gapi.auth2.init({ client_id: CLIENT_ID });
        // });
    }

    var GoogleAuth;
    var SCOPE = "https://www.googleapis.com/auth/youtube.readonly";
    function handleClientLoad() {
        // Load the API's client and auth2 modules.
        // Call the initClient function after the modules load.
        gapi.load("client:auth2", initClient);
    }

    function initClient() {
        // In practice, your app can retrieve one or more discovery documents.
        var discoveryUrl =
            "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest";

        // Initialize the gapi.client object, which app uses to make API requests.
        // Get API key and client ID from API Console.
        // 'scope' field specifies space-delimited list of access scopes.
        gapi.client
            .init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: [discoveryUrl],
                scope: SCOPE,
            })
            .then(function () {
                GoogleAuth = gapi.auth2.getAuthInstance();
                console.log(
                    `🚀 ~ file: YouTube_OAuth.svelte ~ line 80 ~ GoogleAuth`,
                    GoogleAuth
                );

                // Listen for sign-in state changes.
                GoogleAuth.isSignedIn.listen(updateSigninStatus);

                // Handle initial sign-in state. (Determine if user is already signed in.)
                var user = GoogleAuth.currentUser.get();
                setSigninStatus();
            });
    }

    function handleAuthClick() {
        if (GoogleAuth.isSignedIn.get()) {
            console.log(
                `🚀 ~ file: YouTube_OAuth.svelte ~ line 93 ~ handleAuthClick ~ GoogleAuth`,
                GoogleAuth
            );
            // User is authorized and has clicked "Sign out" button.
            GoogleAuth.signOut();
        } else {
            console.log(
                `🚀 ~ file: YouTube_OAuth.svelte ~ line 97 ~ handleAuthClick ~ GoogleAuth`,
                GoogleAuth
            );
            // User is not signed in. Start Google auth flow.
            GoogleAuth.signIn();
        }
    }

    function revokeAccess() {
        GoogleAuth.disconnect();
    }

    function setSigninStatus() {
        var user = GoogleAuth.currentUser.get();
        console.log(
            `🚀 ~ file: YouTube_OAuth.svelte ~ line 107 ~ setSigninStatus ~ user`,
            user
        );
        isAuthorized = user.hasGrantedScopes(SCOPE);
    }

    function updateSigninStatus() {
        setSigninStatus();
    }

    let res = {};
    let items = [];

    function setDisplayContext(res) {
        // currentDisplayContext = res.kind;
        console.log(
            `🔎 setDisplayContext currentDisplayContext`,
            currentDisplayContext
        );
        if (
            res.kind == "youtube#channelListResponse" ||
            res.kind == "youtube#channel"
        ) {
            console.log(
                `🚀 ~ file: YouTube_OAuth.svelte ~ line 244 ~ setDisplayContext ~ res.kind`,
                res.kind
            );
            storeCurrentDisplayContext.set("Channel Details");
        }
        if (res.kind == "youtube#playlistListResponse") {
            console.log(
                `🚀 ~ file: YouTube_OAuth.svelte ~ line 248 ~ setDisplayContext ~ res.kind`,
                res.kind
            );
            storeCurrentDisplayContext.set("Collection");
        }
        if (
            res.kind == "youtube#playlistItemListResponse" ||
            res.kind == "youtube#playlist"
        ) {
            console.log(
                `🚀 ~ file: YouTube_OAuth.svelte ~ line 252 ~ setDisplayContext ~ res.kind`,
                res.kind
            );
            storeCurrentDisplayContext.set("Playlist");
        }
        if (res.kind == "youtube#playlistItem") {
            console.log(
                `🚀 ~ file: YouTube_OAuth.svelte ~ line 256 ~ setDisplayContext ~ res.kind`,
                res.kind
            );
            storeCurrentDisplayContext.set("Video Details");
        }
        if (res.kind == "youtube#videoListResponse") {
            console.log(
                `🚀 ~ file: YouTube_OAuth.svelte ~ line 260 ~ setDisplayContext ~ res.kind`,
                res.kind
            );
            storeCurrentDisplayContext.set("Video Details");
        } else {
            console.log(`res.kind unknown: ${res.kind} full res: `, res);
        }
        console.log(
            `🚀 ~ file: YouTube_OAuth.svelte ~ line 148 ~ setDisplayContext ~ currentDisplayContext`,
            currentDisplayContext
        );
    }

    function searchByChannelName() {
        videosList = [];
        return gapi.client.youtube.channels
            .list({
                part: ["snippet,contentDetails,statistics"],
                forUsername: channelName,
                maxResults: 50,
            })
            .then(
                function (response) {
                    // Handle the results here (response.result has the parsed body).
                    console.log("Response", response);
                    console.log("Result: ", response.result);
                    res = response.result;
                    if (res.items) {
                        setDisplayContext(res);
                        parseResultData(currentDisplayContext, res.items[0]);
                    } else {
                        uploadsId = "Channel not found";
                    }
                    items = res.items[0];
                    channelDetails = items;
                    console.log("items: ", items);
                    storeChannelName.set(channelName);
                    storeChannelDetails.set(channelDetails);
                    storeChannelId.set(items.id);
                },
                function (err) {
                    console.error("Execute error", err);
                }
            );
    }

    function getPlaylistsByChannelId(channelId) {
        console.log(
            `🚀 ~ file: YouTube_OAuth.svelte ~ line 299 ~ getPlaylistsByChannelId ~ channelId`,
            channelId
        );
        playlistsList = [];
        return gapi.client.youtube.playlists
            .list({
                part: ["snippet"],
                channelId: channelId,
                maxResults: maxResults,
            })
            .then(
                function (response) {
                    // Handle the results here (response.result has the parsed body).
                    console.log("Response", response);
                    console.log("Result: ", response.result);

                    res = response.result;
                    // set variables like what we are displaying (playlists, uploads, playlist name)
                    if (res.items) {
                        setDisplayContext(res);
                        parseResultData(currentDisplayContext, res);
                    } else {
                        channelId = "Playlist not found";
                    }
                    // items = res.items[0];
                    // console.log("items: ", items);
                    storePlaylistsList.set(res.items);
                },
                function (err) {
                    console.error("Execute error", err);
                }
            );
    }

    function getVideosByPlaylistId(id) {
        videosList = [];
        return gapi.client.youtube.playlistItems
            .list({
                part: ["snippet,contentDetails"],
                playlistId: `${id}`,
                maxResults: 50,
            })
            .then(
                function (response) {
                    // Handle the results here (response.result has the parsed body).
                    console.log("Response", response);
                    console.log("Result: ", response.result);
                    res = response.result;
                    if (res.items) {
                        setDisplayContext(res);
                        parseResultData(currentDisplayContext, res);
                    } else {
                        id = "Playlist not found";
                    }
                    items = res.items[0];
                    console.log("items: ", items);
                },
                function (err) {
                    console.error("Execute error", err);
                }
            );
    }

    function getVideoFromId(id) {
        videoDetails = {};
        return gapi.client.youtube.videos
            .list({
                part: ["snippet,contentDetails,statistics"],
                id: id,
                maxResults: 50,
            })
            .then(
                function (response) {
                    // Handle the results here (response.result has the parsed body).
                    console.log("Response", response);
                    console.log("Result: ", response.result);
                    res = response.result;
                    if (res.items) {
                        setDisplayContext(res);
                        parseResultData(currentDisplayContext, res);
                    } else {
                        id = "Playlist not found";
                    }
                    items = res.items[0];
                    videoDetails = items;
                    storeVideoDetails.set(videoDetails);
                    console.log("items videoDetails: ", items);
                },
                function (err) {
                    console.error("Execute error", err);
                }
            );
    }

    function parseResultData(type, res) {
        if (type == "Channel Details") {
            console.log(`Name res: `, res);
            channelId = res.id;
            nextPageToken = res.nextPageToken;
            if (res.snippet) {
                channelDescription = res.snippet.description;
                let thumbs = res.snippet.thumbnails;
                channelThumbnails = {
                    default: thumbs.default,
                    high: thumbs.high,
                    medium: thumbs.medium,
                };
            }
            if (res.contentDetails) {
                uploadsId = res.contentDetails.relatedPlaylists.uploads;
                storeUploadsId.set(uploadsId);
            }
        } else if (type == "Collection" || type == "Playlist") {
            res.items.forEach((item) => {
                // videosList = [...videosList, item];
                pageInfo = res.pageInfo;
                pagesOfResults = Math.ceil(
                    res.pageInfo.totalResults / res.pageInfo.resultsPerPage
                );
                nextPageToken = res.nextPageToken;
            });
            console.log(`ID res: `, res);
            if (res.kind == "youtube#playlistListResponse") {
                playlistsList = res.items;
                storePlaylistsList.set(playlistsList);
            } else {
                videosList = res.items;
                storeVideosList.set(videosList);
            }
        } else {
            res.items.forEach((item) => {
                console.log(
                    `🚀 ~ file: YouTube_OAuth.svelte ~ line 306 ~ res.items.forEach ~ item`,
                    item
                );
            });
            console.log(`ID res: `, res);
        }
    }

    function handle(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            if (e.target.ariaLabel == "Channel Name") {
                searchByChannelName();
            } else if (e.target.ariaLabel == "Channel ID") {
                getPlaylistsByChannelId();
            } else if (e.target.ariaLabel == "Uploads ID") {
                getPlaylistsByChannelId();
            } else if (e.target.ariaLabel == "Playlist ID") {
                getPlaylistsByChannelId();
            }
        }
    }
</script>

<svelte:head>
    <script
        src="https://apis.google.com/js/api.js"
        on:load={handleClientLoad}></script>
</svelte:head>
<div>
    <h3 class="center">YouTube OAuth Flow</h3>
    <div class="absolute top-10 right-20">
        {#if isAuthorized}
            <Button color="secondary" on:click={() => revokeAccess()}
                >Revoke Access</Button
            >
            <p>You are signed in and authorized.</p>
        {:else}
            <Button color="blue" on:click={() => handleAuthClick()}
                >Handle Auth</Button
            >
            <p>You are not signed in, or not authorized to use this app.</p>
        {/if}
    </div>
</div>

<div class="grid grid-cols-7 gap-4">
    <div class="grid grid-cols-4 col-start-2">
        <div class="col-span-3">
            <TextField
                bind:value={channelName}
                on:keypress={(e) => handle(e)}
                id="channelName"
                label="Channel Name"
                append="search"
            />
        </div>
        <Button
            class="h-14 self-start mt-2 col-start-4"
            on:click={() => searchByChannelName()}>Search</Button
        >
    </div>
    <div class="grid grid-cols-6 col-start-3">
        <div class="col-span-4">
            <TextField
                bind:value={channelId}
                on:keypress={(e) => handle(e)}
                id="channelId"
                label="Channel ID"
                append="search"
            />
        </div>
        <Button
            class="h-14 self-start mt-2 col-start-5 col-span-2"
            on:click={() => getPlaylistsByChannelId(channelId)}
            >Get Playlists</Button
        >
    </div>
    <div class="grid grid-cols-4 col-start-4">
        <div class="col-span-3">
            <TextField
                bind:value={uploadsId}
                on:keypress={(e) => handle(e)}
                id="uploadsId"
                label="Uploads ID"
                append="search"
            />
        </div>
        <Button
            class="h-14 self-start mt-2 col-start-4"
            on:click={() => getVideosByPlaylistId(uploadsId)}>Get Videos</Button
        >
    </div>

    <div class="grid grid-cols-4 col-start-5">
        <div class="col-span-3">
            <TextField
                bind:value={playlistId}
                on:keypress={(e) => handle(e)}
                id="playlistId"
                label="Playlist ID"
                append="search"
            />
        </div>
        <Button
            class="h-14 self-start mt-2 col-start-4"
            on:click={() => getVideosByPlaylistId(playlistId)}
            >Get Videos</Button
        >
    </div>
    <div class="grid grid-cols-4 col-start-6">
        <div class="col-span-3">
            <TextField
                bind:value={videoId}
                on:keypress={(e) => handle(e)}
                id="videoId"
                label="Video ID"
                append="search"
            />
        </div>
        <Button
            class="h-14 self-start mt-2 col-start-4"
            on:click={() => getVideoFromId(videoId)}>Video Details</Button
        >
    </div>
</div>
<div class="flex flex-wrap justify-start justify-items-start">
    {#if currentDisplayContext == "Channel Details"}
        <ChannelDetails {channelDetails} />
    {/if}

    {#if currentDisplayContext == "Collection"}
        {#if pageInfo.totalResults}
            <h4>
                {currentDisplayContext}: # of playlistsList: {pageInfo.totalResults}
            </h4>
        {/if}
        {#each playlistsList as playlist}
            <Playlist {playlist} />
        {/each}
    {/if}
    {#if currentDisplayContext == "Playlist"}
        {#each videosList as item}
            <PlaylistItem {item} />
        {/each}
    {/if}
    {#if currentDisplayContext == "Video Details"}
        <Video {videoDetails} />
    {/if}
</div>

<style>
    .videoItem {
        margin: 0.25rem;
        cursor: pointer;
        background: rgba(72, 35, 158, 0.1);
        border: 1px solid rgba(72, 35, 158, 0.7);
    }
    .videoItem:hover {
        background: rgba(0, 0, 0, 0.25);
    }
    .thumbnail {
        background: black;
    }
    .hidden {
        display: none;
    }
</style>
