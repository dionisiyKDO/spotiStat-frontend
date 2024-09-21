<script>
    let { track } = $props();
    console.log(track);
    
</script>


<!-- <div>
    <h3>{track.track_name}</h3>
    <image src={track.image_url} alt='Album art' height='100' width='100' />
    <p>{track.track_artist_name}</p>
    <p>{Math.round(track.total_hours_played * 100) / 100} hours</p>
</div> -->

<div>
    <div class="track-number">{track.index + 1}</div>
    <div class="album-image-wrapper">
        <img src={track.album_image_url} alt="Album art" class="album-image">
    </div>
    <div class="track-info">
        <div class="track-name">{track.name}</div>
        <div class="track-artist">{track.artist}</div>
        <div class="track-meta">
            <div class="track-time-played">{Math.round(track.total_hours_played * 100) / 100} hours</div>
        </div>
    </div>
</div>


<style>
</style>