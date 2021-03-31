<script>
    export let playlist;

    import { storePlaylistId, storePlaylistName } from "../../scripts/stores.js";
</script>

<div
    class="playlistItem grid row-start-auto grid-cols-12 m-1"
    on:click={() => {
        storePlaylistId.set(playlist.id);
        storePlaylistName.set(playlist.snippet.title)
        console.log(`🚀 ~ file: Playlist.svelte ~ line 11 ~ playlist.id ${ playlist.id} name ${playlist.snippet.title}`)
    }}
>
    <img
        class="thumbnail col-start-1 col-span-1"
        src={playlist.snippet.thumbnails.default.url}
        width={playlist.snippet.thumbnails.default.width}
        height={playlist.snippet.thumbnails.default.height}
    />
    <div class="col-start-2 col-span-8 justify-self-start">
        {playlist.snippet.title}
    </div>
    <div class="col-start-10 col-span-3 flex-col">
        Date: <div>{playlist.snippet.publishedAt}</div>
        Id:
        <div>{JSON.stringify(playlist.id)}</div>
    </div>
</div>

<style>
    .playlistItem {
        margin: 0.25rem;
        cursor: pointer;
        background: rgba(72, 35, 158, 0.1);
        border: 1px solid rgba(72, 35, 158, 0.7);
    }
    .playlistItem:hover {
        background: rgba(0, 0, 0, 0.25);
    }
</style>
