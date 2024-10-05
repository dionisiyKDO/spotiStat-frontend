<script>
    import D3Chart from './D3Chart.svelte';
    
    let artist = $state('塞壬唱片-MSR');
    let artist_meta = $state({});
    let timeline_data = $state([]);
    let artist_stats = $state({});
    let error = $state('');

    // 塞壬唱片-MSR
    // Imagine Dragons
    
    async function fetchArtistStats() {
        try {
            const response = await fetch(`/api/db/history/artist/${artist}/stats`);
            const data = await response.json();
            console.log(data);
            if (!response.ok) {
                error = data.error || 'Failed to fetch artist stats';
            } else {
                artist_stats = data;
                timeline_data = fillMissingDates(artist_stats);
                console.log(timeline_data);
            }
        } catch (err) {
            error = err;
        }
    }

    // TODO: extract this function and reuse it across files
    function fillMissingDates(data) {
        const startDate = new Date(data.first_played);
        const endDate = new Date(data.last_played);

        const allDates = [];
        let currentDate = startDate;
        while (currentDate <= endDate) {
            allDates.push(currentDate.toISOString().split('T')[0]); // Extract date part
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return allDates.map(date => {
            const existingItem = data.timeline_data.find(item => item.date === date);
            return existingItem ? {
                date: new Date(existingItem.date),
                total_minutes_played: parseInt((existingItem.total_ms_played / 60000).toFixed(2)),
                total_ms_played: existingItem.total_ms_played,
                play_count: existingItem.play_count
            } : {
                date: new Date(date),
                total_minutes_played: 0,
                total_ms_played: 0,
                play_count: 0
            };
        });
    }

    $effect(() => {
        fetchArtistStats();
    });
</script>

{#if error}
    <p style="color: darkred">{error}</p>
{:else}
    <div>
        <h1>{artist}</h1>
    </div>

    <div>
        {#if timeline_data.length > 0}
            <D3Chart {timeline_data}/>
        {/if}

        <p>Total plays: {artist_stats.total_plays}</p>
        <p>Total time played: {(artist_stats.total_ms_played / 3600000).toFixed(2)} hours</p>
        <p>First played: {new Date(artist_stats.first_played).toLocaleDateString()}</p>    
        <p>Last played: {new Date(artist_stats.last_played).toLocaleDateString()}</p>
    </div>
{/if}
