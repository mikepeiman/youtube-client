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
    // import colors from 'tailwindcss/colors'

    const API_KEY = "AIzaSyAXl6KBB0aJ1zFGJoQVzl45aXXpySJt8eQ";
    const CLIENT_ID =
        "765839078612-0pfbtcgjduc7di75ook1i6i0ldtcdoou.apps.googleusercontent.com";
    let mounted = false,
        gapiLoaded = false;

    let forUsername = "";
    let channelName = "";
    let currentDisplayContext = "";
    // Options: "Channel Details", "Collection", "Playlist", "Video Details"
    let channelId = "";
    let videoId = "";
    let channelDetails = {};
    let videoDetails = {};
    let channelDescription = "";
    let channelThumbnails = {};
    let nextPageToken = "";
    let pageInfo = {};
    let playlists = [];
    let videos = [];
    let maxResults = 50;
    let videosListData = [];
    // let lookupPart = "snippet";
    let lookupPart = "contentDetails";
    let uploadsId = "";
    let playlistId = "";
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
    });

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
        currentDisplayContext = res.kind;
        console.log(
            `🚀 ~ file: YouTube_OAuth.svelte ~ line 139 ~ setDisplayContext ~ currentDisplayContext`,
            currentDisplayContext
        );
        if (res.kind == "youtube#channelListResponse") {
            currentDisplayContext = "Channel Details";
        }
        if (res.kind == "youtube#playlistListResponse") {
            currentDisplayContext = "Collection";
        }
        if (res.kind == "youtube#playlistItemListResponse") {
            currentDisplayContext = "Playlist";
        }
        if (res.kind == "youtube#playlistItem") {
            currentDisplayContext = "Video Details";
        }
        if (res.kind == "youtube#videoListResponse") {
            currentDisplayContext = "Video Details";
        }
        console.log(
            `🚀 ~ file: YouTube_OAuth.svelte ~ line 148 ~ setDisplayContext ~ currentDisplayContext`,
            currentDisplayContext
        );
    }

    function searchByChannelName() {
        videos = [];
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
                },
                function (err) {
                    console.error("Execute error", err);
                }
            );
    }

    function getPlaylistsByChannelId(channelId) {
        playlists = [];
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
                    items = res.items[0];
                    console.log("items: ", items);
                },
                function (err) {
                    console.error("Execute error", err);
                }
            );
    }

    function getVideosByPlaylistId(id) {
        videos = [];
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
                    videoDetails = items
                    console.log("items: ", items);
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
            }
        } else if (type == "Collection" || type == "Playlist") {
            res.items.forEach((item) => {
                videos = [...videos, item];
                pageInfo = res.pageInfo;
                pagesOfResults = Math.ceil(
                    res.pageInfo.totalResults / res.pageInfo.resultsPerPage
                );
                nextPageToken = res.nextPageToken;
            });
            console.log(`ID res: `, res);
            videos = res.items;
            playlists = res.items;
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

    function testOnBlur(val) {
        console.log(`testChannelName on blur: ${val}`);
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
            <Button
                color="secondary"
                class="primary"
                on:click={() => revokeAccess()}>Revoke Access</Button
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
                on:blur={() => testOnBlur(channelName)}
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
                on:blur={() => testOnBlur(channelId)}
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
                on:blur={() => testOnBlur(channelName)}
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
                on:blur={() => testOnBlur(channelName)}
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
                on:blur={() => testOnBlur(channelName)}
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
    {#if pageInfo.totalResults}
    <h4>
        {currentDisplayContext}, total videos: {pageInfo.totalResults}
    </h4>
{/if}
        <div
            class="playlistItem grid row-start-auto grid-cols-12 m-1"
            on:click={() => {
                playlistId = playlist.id;
            }}
        >
            <img
                class="thumbnail col-start-1 col-span-1"
                src={channelDetails.snippet.thumbnails.default.url}
                width={channelDetails.snippet.thumbnails.default.width}
                height={channelDetails.snippet.thumbnails.default.height}
            />
            <div class="col-start-2 col-span-3 justify-self-start">
                {channelDetails.snippet.title}
            </div>
            <div class="col-start-5 flex-col">
                Creation Date: <div>{channelDetails.snippet.publishedAt}</div>
                Id:
                <div>{JSON.stringify(channelDetails.id)}</div>
            </div>
        </div>
    {/if}

    {#if currentDisplayContext == "Collection"}
    {#if pageInfo.totalResults}
    <h4>
        {currentDisplayContext}: # of playlists: {pageInfo.totalResults}
    </h4>
{/if}
        {#each playlists as playlist}
            <div
                class="playlistItem grid row-start-auto grid-cols-12 m-1"
                on:click={() => {
                    playlistId = playlist.id;
                }}
            >
                <img
                    class="thumbnail col-start-1 col-span-1"
                    src={playlist.snippet.thumbnails.default.url}
                    width={playlist.snippet.thumbnails.default.width}
                    height={playlist.snippet.thumbnails.default.height}
                />
                <div class="col-start-2 col-span-10 justify-self-start">
                    {playlist.snippet.title}
                </div>
                <div class="col-start-12 flex-col">
                    Date: <div>{playlist.snippet.publishedAt}</div>
                    Id:
                    <div>{JSON.stringify(playlist.id)}</div>
                </div>
            </div>
        {/each}
    {/if}
    {#if currentDisplayContext == "Playlist"}
        {#each videos as video}
            {#if video.snippet.title != "deleted" || video.snippet.title != "private"}
                <div
                    class="videoItem grid row-start-auto grid-cols-12 m-1"
                    on:click={() => (videoId = video.contentDetails.videoId)}
                >
                    {#if video.snippet.thumbnails.default}
                        <img
                            class="thumbnail col-start-1 col-span-1"
                            src={video.snippet.thumbnails.default.url}
                            width={video.snippet.thumbnails.default.width}
                            height={video.snippet.thumbnails.default.height}
                        />
                    {/if}
                    <div class="col-start-2 col-span-5 justify-self-start">
                        {video.snippet.title}
                    </div>
                    <div class="col-start-7 col-span-5 justify-self-start">
                        {video.snippet.videoOwnerChannelTitle}
                    </div>
                    <div class="col-start-12 flex-col">
                        Date: <div>{video.contentDetails.videoPublishedAt}</div>
                        Id:
                        <div>{video.contentDetails.videoId}</div>
                    </div>
                </div>
            {:else}
                Video deleted or private
            {/if}
        {/each}
    {/if}
    {#if currentDisplayContext == "Video Details"}
        <div class="playlistItem grid row-start-auto grid-cols-12 m-1">
            <img
                class="thumbnail col-start-1 col-span-1"
                src={videoDetails.snippet.thumbnails.default.url}
                width={videoDetails.snippet.thumbnails.default.width}
                height={videoDetails.snippet.thumbnails.default.height}
            />
            <div class="col-start-2 col-span-3 justify-self-start">
                {videoDetails.snippet.title}
            </div>
            <div class="col-start-5 flex-col">
                Creation Date: <div>{videoDetails.snippet.publishedAt}</div>
                Id:
                <div>{JSON.stringify(videoDetails.id)}</div>
            </div>
        </div>
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
