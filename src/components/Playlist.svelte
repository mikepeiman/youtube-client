<script>
    export let playlist
    
    import { storePlaylistId} from '../../scripts/stores.js'
    let playlistId
</script>

<div
class="playlistItem grid row-start-auto grid-cols-12 m-1"
on:click={() => {
    storePlaylistId.set(playlist.id);
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