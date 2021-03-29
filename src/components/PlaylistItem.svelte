<script>
    export let item
</script>

{#if item.snippet.title != "deleted" || item.snippet.title != "private"}
<div
    class="videoItem grid row-start-auto grid-cols-12 m-1"
    on:click={() => {
        videoId = item.contentDetails.videoId;
        storeVideoId.set(videoId);
    }}
>
    {#if item.snippet.thumbnails.default}
        <img
            class="thumbnail col-start-1 col-span-1"
            src={item.snippet.thumbnails.default.url}
            width={item.snippet.thumbnails.default.width}
            height={item.snippet.thumbnails.default.height}
        />
    {/if}
    <div class="col-start-2 col-span-5 justify-self-start">
        {item.snippet.title}
    </div>
    <div class="col-start-7 col-span-5 justify-self-start">
        {item.snippet.videoOwnerChannelTitle}
    </div>
    <div class="col-start-12 flex-col">
        Date: <div>{item.contentDetails.videoPublishedAt}</div>
        Id:
        <div>{item.contentDetails.videoId}</div>
    </div>
</div>
{:else}
Video deleted or private
{/if}