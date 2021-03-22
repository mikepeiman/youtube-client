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

    onMount(() => {
        if (gapiLoaded) {
            console.log(`GAPI loaded`);
            // authenticate().then(loadClient)
            gapi.load("client:auth2", function () {
                gapi.auth2.init({ client_id: CLIENT_ID });
            });
            // console.log(x)
        }
    });

    function loadGapi() {
        mounted = true;
        gapiLoaded = true;
        gapi.load("client:auth2", function () {
            gapi.auth2.init({ client_id: CLIENT_ID });
        });
    }

    function authenticate() {
        let auth = gapi.auth2;
        console.log(`gapi ${gapi}`, gapi);
        console.log(`gapi.auth2 ${auth}`);
        return gapi.auth2
            .getAuthInstance()
            .signIn({
                scope: "https://www.googleapis.com/auth/youtube.readonly",
            })
            .then(
                function () {
                    console.log("Sign-in successful");
                },
                function (err) {
                    console.error("Error signing in", err);
                }
            );
    }
    function loadClient() {
        gapi.client.setApiKey(API_KEY);
        return gapi.client
            .load(
                "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"
            )
            .then(
                function () {
                    console.log("GAPI client loaded for API");
                },
                function (err) {
                    console.error("Error loading GAPI client for API", err);
                }
            );
    }

    let res = {};
    let items = [];
    const listTwoLines = [];
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
        if(playlist == "channel"){
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
                        channelId = "Channel not found";
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

    function setData(items) {
        items.forEach(item, (i) => {
            listTwoLines[i] = {
                text: item,
                icon: "✨",
                subheading: "subtext",
            };
        });
        console.log(`listTwoLines `, listTwoLines);
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
    <script src="https://apis.google.com/js/api.js" on:load={loadGapi}></script>
</svelte:head>

<h4>YouTube GAPI interface</h4>

<div class="grid grid-cols-5 gap-4">
    <Button on:click={() => authenticate().then(loadClient())}
        >authorize and load</Button
    >
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
            on:click={() => executePlaylistsByChannelId("channel")}>Search</Button
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
            on:click={() => executePlaylistsByChannelId("uploads")}>Search</Button
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
