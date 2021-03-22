<script>
    /**
     * Sample JavaScript code for youtube.channels.list
     * See instructions for running APIs Explorer code samples locally:
     * https://developers.google.com/explorer-help/guides/code_samples#javascript
     */

    import { onMount } from "svelte";
    import searchForChannel from "./searchForChannel.js";
    import "smelte/src/tailwind.css";
    import Button from "smelte/src/components/Button";
    import List from "smelte/src/components/List";
    import TextField from "smelte/src/components/TextField";
    import Test from "../Test.svelte";

    const API_KEY = "AIzaSyAXl6KBB0aJ1zFGJoQVzl45aXXpySJt8eQ";
    const CLIENT_ID =
        "765839078612-0pfbtcgjduc7di75ook1i6i0ldtcdoou.apps.googleusercontent.com";
    let URI = "https://www.googleapis.com/youtube/v3/";
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
    let lookupPart = "snippet";
    let playlistId = "";
    let thisId = "";
    let pagesOfResults = 0;
    onMount(() => {
        // fs.readFile("./test.json", "utf8", (err, data) => {
        //     if (err) {
        //         console.log(`Error reading file from disk: ${err}`);
        //     } else {
        //         // parse JSON string to JSON object
        //         const databases = JSON.parse(data);
        //         // print all databases
        //         databases.forEach((db) => {
        //             console.log(`${db.name}: ${db.type}`);
        //         });
        //     }
        // });
    });

    async function getChannelByName(part) {
        videos = [];
        let URL = `${URI}channels?part=${part}&forUsername=${channelName}&key=${API_KEY}`;
        console.log(`URL ${URL}`);
        let response = await fetch(URL);
        let result = await response.json();
        if (result.items) {
            parseResultData("name", result.items[0]);
        } else {
            if (response.ok) {
                URL = `${URI}search?part=snippet&q=${channelName}&type=channel&key=${API_KEY}`;
                response = await fetch(URL);
                result = await response.json();
                console.log(
                    `🚀 ~ file: YouTube_REST.svelte ~ line 66 ~ getChannelByName ~ result`,
                    result
                );
                let searchResult = await searchForChannel(channelName, result);
                console.log(
                    `🚀 ~ file: YouTube_REST.svelte ~ line 60 ~ getChannelByName ~ searchResult`,
                    searchResult
                );
                if (searchResult.snippet) {
                    channelId = await searchResult.snippet.channelId;
                } else {
                    channelId = "Channel not found";
                }
            } else {
                channelId = "Channel not found";
            }
        }
        console.log(`response: `, response);
        console.log(`result: `, result);
    }

    async function getPlaylistsByChannelId() {
        videos = [];
        let URL = `${URI}search?order=date&part=${lookupPart}&maxResults=${maxResults}&channelId=${channelId}&key=${API_KEY}`;
        console.log(`URL ${URL}`);
        let response = await fetch(URL);
        let result = await response.json();
        console.log(
            `🚀 ~ file: YouTube.svelte ~ line 66 ~ getPlaylistsByChannelId ~ result`,
            result
        );
        if (result.items) {
            parseResultData("id", result);
        } else {
            channelId = "Channel not found";
        }
        if (nextPageToken) {
            console.log(
                `🚀 ~ file: YouTube.svelte ~ line 59 ~ getPlaylistsByChannelId ~ nextPageToken`,
                nextPageToken
            );
            // let i = 0;
            // while (nextPageToken) {
            //     i++;
            //     URL = `${URI}search?pageToken=${nextPageToken}&order=date&part=snippet&maxResults=${maxResults}&channelId=${channelId}&key=${API_KEY}`;
            //     let response = await fetch(URL);
            //     let result = await response.json();
            //     if (result.items) {
            //         parseResultData("id", result);
            //     } else {
            //         channelId = "Channel not found";
            //     }
            // }
        }
    }

    async function getPlaylistId(id) {
        playlistId = id;
        console.log(
            `🚀 ~ file: YouTube_REST.svelte ~ line 133 ~ getPlaylistId ~ playlistId`,
            playlistId
        );
    }

    function parseResultData(type, res) {
        videos = [];
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
                playlistId = res.contentDetails.relatedPlaylists.uploads;
            } else {
            }
        } else if (type == "id") {
            res.items.forEach((item) => {
                console.log(
                    `🚀 ~ file: YouTube_REST.svelte ~ line 136 ~ res.items.forEach ~ item`,
                    item
                );
                videos = [...videos, item];
                pageInfo = res.pageInfo;
                pagesOfResults = Math.ceil(
                    res.pageInfo.totalResults / res.pageInfo.resultsPerPage
                );
                console.log(
                    `🚀 ~ file: YouTube_REST.svelte ~ line 142 ~ res.items.forEach ~ pagesOfResults`,
                    pagesOfResults
                );
                nextPageToken = res.nextPageToken;
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
                getChannelByName(lookupPart);
            } else if (e.target.ariaLabel == "Channel ID") {
                getPlaylistsByChannelId(channelId);
            }
        }
    }
    function assignId(video) {
        if (video.id.videoId) {
            // console.log(`🚀 ~ file: YouTube_REST.svelte ~ line 197 ~ assignId ~ video.id.videoId`, video.id.videoId)
            thisId = video.id.videoId;
        } else if (video.id.channelId) {
            // console.log(`🚀 ~ file: YouTube_REST.svelte ~ line 200 ~ assignId ~ video.id.channelId`, video.id.channelId)
            thisId = video.id.channelId;
        } else if (video.id.playlistId) {
            // console.log(`🚀 ~ file: YouTube_REST.svelte ~ line 203 ~ assignId ~ video.id.playlistId`, video.id.playlistId)
            thisId = video.id.playlistId;
        } else {
            thisId = "ERR: ID not found";
        }
    }
</script>

<svelte:head>
    <link
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500|Material+Icons&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<h4>YouTube REST iterface</h4>
<div class="grid grid-cols-5 gap-4">
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
            on:click={() => getChannelByName(lookupPart)}>Search</Button
        >
    </div>
    <div class="grid grid-cols-4 col-start-3">
        <div class="col-span-3">
            <TextField
                bind:value={channelId}
                on:blur={() => testOnBlur(channelName)}
                on:keypress={(e) => handle(e)}
                label="Channel ID"
                append="search"
            />
        </div>
        <Button
            class="h-14 self-start mt-2 col-start-4"
            on:click={() => getPlaylistsByChannelId()}>Search</Button
        >
    </div>
    <div class="grid grid-cols-4 col-start-4">
        <div class="col-span-3">
            <TextField
                bind:value={playlistId}
                on:blur={() => testOnBlur(channelName)}
                on:keypress={(e) => handle(e)}
                label="Playlist ID"
                append="search"
            />
        </div>
        <Button
            class="h-14 self-start mt-2 col-start-4"
            on:click={() => getPlaylistsByChannelId()}>Search</Button
        >
    </div>
</div>
<div class="flex flex-wrap justify-start justify-items-start">
    {#if pageInfo.totalResults}
        <h4>Playlist total videos {pageInfo.totalResults}</h4>
    {/if}
    {#each videos as video}
        <div class="hidden">
            {assignId(video)}
        </div>

        <div
            class="videoItem grid row-start-auto grid-cols-12 m-1"
            on:click={() => getPlaylistId(thisId)}
        >
            <img
                class="thumbnail col-start-1 col-span-1"
                src={video.snippet.thumbnails.default.url}
                width={video.snippet.thumbnails.default.width}
                height={video.snippet.thumbnails.default.height}
            />
            <div class="col-start-2 col-span-10 justify-self-start">
                {video.snippet.title}
            </div>
            <div class="col-start-12 flex-col">
                Date: <div>{video.snippet.publishedAt}</div>
                Id:
                <div>{thisId}</div>
            </div>
        </div>
    {/each}
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
