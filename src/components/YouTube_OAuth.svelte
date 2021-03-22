<script>
    /**
     * Sample JavaScript code for youtube.channels.list
     * See instructions for running APIs Explorer code samples locally:
     * https://developers.google.com/explorer-help/guides/code_samples#javascript
     */

    import { onMount } from "svelte";
    import "smelte/src/tailwind.css";
    import Button from "smelte/src/components/Button";
    import TextField from "smelte/src/components/TextField";

    const API_KEY = "AIzaSyAXl6KBB0aJ1zFGJoQVzl45aXXpySJt8eQ";
    const CLIENT_ID =
        "765839078612-0pfbtcgjduc7di75ook1i6i0ldtcdoou.apps.googleusercontent.com";
    let mounted = false,
        gapiLoaded = false;

    let forUsername = "";
    let channelName = "";
    let channelId = "";
    let channelDescription = "";
    let channelThumbnails = {};
    let nextPageToken = "";
    let pageInfo = {};
    let videos = [];
    let maxResults = 50;
    let videosListData = [];
    // let lookupPart = "snippet";
    let lookupPart = "contentDetails";
    let uploadsId = "";
    let pagesOfResults = 0;
    let isAuthorized = false

    onMount(() => {
        if (gapiLoaded) {
            console.log(`GAPI loaded`);
            // authenticate().then(loadClient)
            // gapi.load("client:auth2", function () {
            //     gapi.auth2.init({ client_id: CLIENT_ID });
            // });
            handleClientLoad()
        }
    });

    function loadGapi() {
        mounted = true;
        gapiLoaded = true;
        handleClientLoad()
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
                console.log(`🚀 ~ file: YouTube_OAuth.svelte ~ line 80 ~ GoogleAuth`, GoogleAuth)

                // Listen for sign-in state changes.
                GoogleAuth.isSignedIn.listen(updateSigninStatus);

                // Handle initial sign-in state. (Determine if user is already signed in.)
                var user = GoogleAuth.currentUser.get();
                setSigninStatus();
            });
    }

    function handleAuthClick() {
        if (GoogleAuth.isSignedIn.get()) {
            console.log(`🚀 ~ file: YouTube_OAuth.svelte ~ line 93 ~ handleAuthClick ~ GoogleAuth`, GoogleAuth)
            // User is authorized and has clicked "Sign out" button.
            GoogleAuth.signOut();
        } else {
            console.log(`🚀 ~ file: YouTube_OAuth.svelte ~ line 97 ~ handleAuthClick ~ GoogleAuth`, GoogleAuth)
            // User is not signed in. Start Google auth flow.
            GoogleAuth.signIn();
        }
    }

    function revokeAccess() {
        GoogleAuth.disconnect();
    }

    function setSigninStatus() {
        var user = GoogleAuth.currentUser.get();
        console.log(`🚀 ~ file: YouTube_OAuth.svelte ~ line 107 ~ setSigninStatus ~ user`, user)
        isAuthorized = user.hasGrantedScopes(SCOPE);
        if (isAuthorized) {
            // $("#sign-in-or-out-button").html("Sign out");
            // $("#revoke-access-button").css("display", "inline-block");
            // $("#auth-status").html(
            //     "You are currently signed in and have granted " +
            //         "access to this app."
            // );
        } else {
            // $("#sign-in-or-out-button").html("Sign In/Authorize");
            // $("#revoke-access-button").css("display", "none");
            // $("#auth-status").html(
            //     "You have not authorized this app or you are " + "signed out."
            // );
        }
    }

    function updateSigninStatus() {
        setSigninStatus();
    }
    let res = {};
    let items = [];
    // Make sure the client is loaded and sign-in is complete before calling this method.
    function executePlaylistsByChannelName() {
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
                        parseResultData("name", res.items[0]);
                    } else {
                        uploadsId = "Channel not found";
                    }
                    items = res.items[0];
                    console.log("items: ", items);
                    // setData(items)
                },
                function (err) {
                    console.error("Execute error", err);
                }
            );
    }

    function executePlaylistsByChannelId(playlist) {
        if (playlist == "channel") {
            return gapi.client.youtube.channels
                .list({
                    part: ["snippet,contentDetails"],
                    id: channelId,
                    maxResults: 50,
                })
                .then(
                    function (response) {
                        // Handle the results here (response.result has the parsed body).
                        console.log("Response", response);
                        console.log("Result: ", response.result);
                        res = response.result;
                        if (res.items) {
                            parseResultData("id", res);
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
        } else if (playlist == "uploads") {
            return gapi.client.youtube.playlistItems
                .list({
                    part: ["snippet,contentDetails"],
                    playlistId: uploadsId,
                    maxResults: 50,
                })
                .then(
                    function (response) {
                        // Handle the results here (response.result has the parsed body).
                        console.log("Response", response);
                        console.log("Result: ", response.result);
                        res = response.result;
                        if (res.items) {
                            parseResultData("id", res);
                        } else {
                            uploadsId = "Playlist not found";
                        }
                        items = res.items[0];
                        console.log("items: ", items);
                    },
                    function (err) {
                        console.error("Execute error", err);
                    }
                );
        }
    }

    function parseResultData(type, res) {
        if (type == "name") {
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
        } else if (type == "id") {
            res.items.forEach((item) => {
                videos = [...videos, item];
                pageInfo = res.pageInfo;
                pagesOfResults = Math.ceil(
                    res.pageInfo.totalResults / res.pageInfo.resultsPerPage
                );
                console.log(
                    "🚀 ~ file: YouTube.svelte ~ line 91 ~ res.items.forEach ~ pagesOfResults",
                    pagesOfResults
                );
                nextPageToken = res.nextPageToken;
                console.log(
                    "🚀 ~ file: YT3.svelte ~ line 66 ~ parseResultData ~ item",
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
                executePlaylistsByChannelName();
            } else if (e.target.ariaLabel == "Channel ID") {
                executePlaylistsByChannelId();
            }
        }
    }
</script>

<svelte:head>
    <script src="https://apis.google.com/js/api.js" on:load={handleClientLoad}></script>
</svelte:head>

<h4>YouTube OAuth Flow</h4>

<div class="grid grid-cols-5 gap-4">
    {#if isAuthorized}
    <Button on:click={() => revokeAccess()}
        >Revoke Access</Button
    >
    {:else}
    <Button on:click={() => handleAuthClick()}
        >Handle Auth</Button
    >
    {/if}

    <div class="grid grid-cols-4 col-start-2">
        <div class="col-span-3">
            <TextField
                bind:value={channelName}
                on:blur={() => testOnBlur(channelName)}
                on:keypress={(e) => handle(e)}
                label="Channel Name"
                append="search"
            />
        </div>
        <Button
            class="h-14 self-start mt-2 col-start-4"
            on:click={() => executePlaylistsByChannelName()}>Search</Button
        >
    </div>
    <div class="grid grid-cols-4 col-start-3">
        <div class="col-span-3">
            <TextField
                bind:value={channelId}
                on:blur={() => testOnBlur(channelId)}
                on:keypress={(e) => handle(e)}
                label="Channel ID"
                append="search"
            />
        </div>
        <Button
            class="h-14 self-start mt-2 col-start-4"
            on:click={() => executePlaylistsByChannelId("channel")}
            >Search</Button
        >
    </div>
    <div class="grid grid-cols-4 col-start-4">
        <div class="col-span-3">
            <TextField
                bind:value={uploadsId}
                on:blur={() => testOnBlur(channelName)}
                on:keypress={(e) => handle(e)}
                label="Uploads ID"
                append="search"
            />
        </div>
        <Button
            class="h-14 self-start mt-2 col-start-4"
            on:click={() => executePlaylistsByChannelId("uploads")}
            >Search</Button
        >
    </div>
</div>
<div class="flex flex-wrap justify-start justify-items-start">
    {#if pageInfo.totalResults}
        <h4>Playlist total videos {pageInfo.totalResults}</h4>
    {/if}
    {#each videos as video}
        <div class="grid row-start-auto grid-cols-12 m-1">
            <img
                class="col-start-1 col-span-1"
                src={video.snippet.thumbnails.default.url}
                width={video.snippet.thumbnails.default.width}
                height={video.snippet.thumbnails.default.height}
            />
            <div class="col-start-2 col-span-10 justify-self-start">
                {video.snippet.title}
            </div>
            <div class="col-start-12 ">{video.snippet.publishedAt}</div>
        </div>
    {/each}
</div>
