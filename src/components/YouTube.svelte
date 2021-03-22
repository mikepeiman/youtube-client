<script>
    /**
     * Sample JavaScript code for youtube.channels.list
     * See instructions for running APIs Explorer code samples locally:
     * https://developers.google.com/explorer-help/guides/code_samples#javascript
     */

    import { onMount } from "svelte";
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
    let lookupPart = "contentDetails";
    let uploadsId = "";
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
        let URL = `${URI}channels?part=${part}&forUsername=${channelName}&key=${API_KEY}`;
        console.log(`URL ${URL}`);
        let response = await fetch(URL);
        let result = await response.json();
        if (result.items) {
            parseResultData("name", result.items[0]);
        }
        // console.log(`response: `, response);
        // console.log(`result: `, result);
    }

    async function getChannelById() {
        let URL = `${URI}search?order=date&part=snippet&maxResults=${maxResults}&channelId=${channelId}&key=${API_KEY}`;
        console.log(`URL ${URL}`);
        let response = await fetch(URL);
        let result = await response.json();
        if (result.items) {
            parseResultData("id", result);
        } else {
            channelId = "Channel not found";
        }
        if (nextPageToken) {
            console.log(
                `🚀 ~ file: YouTube.svelte ~ line 59 ~ getChannelById ~ nextPageToken`,
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
                getChannelByName(lookupPart);
            } else if (e.target.ariaLabel == "Channel ID") {
                getChannelById(channelId);
            }
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
            on:click={() => getChannelById()}>Search</Button
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
            on:click={() => getChannelById()}>Search</Button
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
