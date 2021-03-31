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
    import YouTubeItemsForm from "./YouTubeItemsForm.svelte";
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
    $: videoId = $storeVideoId;
    $: channelDetails = {};
    $: videoDetails = $storeVideoDetails;
    let channelDescription = "";
    let channelThumbnails = {};
    $: nextPageToken = "";
    let pageInfo = {};
    // $: playlistsList = lsget("playlistsList")
    let playlistsList
    $: videosList = []
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

    let unsubscribe = storeVideosList.subscribe((val) => {
        console.log(
            `🚀 ~ file: YouTube_OAuth.svelte ~ storeVideosList ~ onMount ~ val`,
            val
        );
        videosList = val
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
    storePlaylistsList.subscribe((val) => {
        console.log(
            `🚀 ~ file: YouTube_OAuth.svelte ~ storePlaylistsList ~ onMount ~ val`,
            val
        );
        playlistsList = val
    });
    storeVideosList.subscribe((val) => {
        console.log(
            `🚀📽📽📽 ~ file: YouTube_OAuth.svelte ~ storeVideosList ~ onMount ~ val`,
            val
        );
        videosList = val
    });
    storePlaylistId.subscribe(val => {
        console.log(
            `🚀 ~ file: YouTube_OAuth.svelte ~ storePlaylistId ~ onMount ~ val`,
            val
        );
    })

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
        playlistsList = lsget("playlistsList");
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

<YouTubeItemsForm {channelName} {channelId} {uploadsId} {playlistId} {videoId} />

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
