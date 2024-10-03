<script lang="ts">
    import {
        fetchTrackMeta,
        fetchTrackStats,
        type TrackMeta,
        type TrackStats,
    } from "./load";
    import D3Chart from "./D3Chart.svelte";

    // 4DMKwE2E2iYDKY01C335Uw carry on
    // 2UZtI2HUyLRzqBjodvcUmY rx medicate
    // 3UhNeRObinbV3mtqPddGux pyrolisis
    let track_id = $state("3UhNeRObinbV3mtqPddGux");
    let track_stats_req: Promise<TrackStats> | null = $state(null);
    let track_meta_req: Promise<TrackMeta> | null = $state(null);

    $effect(() => {
        track_stats_req = fetchTrackStats(track_id);
        track_meta_req = fetchTrackMeta(track_id);
    });
</script>

{#if track_meta_req !== null && track_stats_req !== null}
    {#await track_meta_req}
        <p>Loading.....</p>
    {:then track_meta}
        <div>
            <h1>{track_meta.name}</h1>
            <div style="margin-bottom: 30px;">
                <p>Artists:</p>

                {#each track_meta.artists as artist, index}
                    <p>{index + 1} {artist.name}</p>
                {/each}
                {#each track_meta.artists as artist, index}
                    <p>{index + 1} {artist.name}</p>
                {/each}
                <p>No artists found</p>
            </div>
            <div style="margin-bottom: 30px;">
                <p>Album:</p>
                <p>{track_meta.album.name}</p>
                <p>{track_meta.album.release_date}</p>
            </div>
            <p>Track popularity: {track_meta.popularity}</p>
        </div>
    {/await}

    {#await track_stats_req then track_stats}
        <div>
            {#if track_stats.timeline_data.length > 0}
                <D3Chart timeline_data={track_stats.timeline_data} />
            {/if}

            <p>Total plays: {track_stats.total_plays}</p>
            <p>
                Total time played: {(
                    track_stats.total_ms_played / 3600000
                ).toFixed(2)} hours
            </p>
            <p>
                First played: {new Date(
                    track_stats.first_played
                ).toLocaleDateString()}
            </p>
            <p>
                Last played: {new Date(
                    track_stats.last_played
                ).toLocaleDateString()}
            </p>
        </div>
    {/await}
{/if}

<style>
</style>
