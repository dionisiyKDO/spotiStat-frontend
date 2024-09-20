<div class="section-column">
    <h2>Top artists</h2>
    {#if tracks.length > 0}
        <ul>
            {#each tracks as track}
                <li>
                    <a href="/artist/{track.artist_id}">{track.artist_name}</a>
                </li>
            {/each}
        </ul>
    {:else}
        <p>No tracks found</p>
    {/if}
</div>