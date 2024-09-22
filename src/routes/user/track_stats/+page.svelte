<script>
    import D3Chart from './D3Chart.svelte';
    
    let track_id = $state('3UhNeRObinbV3mtqPddGux');
    let track_stats = $state({});
    let timeline_data = $state([]);
    let error = $state('');

    async function fetchTrackStats() {
        try {
            const response = await fetch(`/api/db/history/track/${track_id}/stats`);
            const data = await response.json();
            if (!response.ok) {
                error = data.error || 'Failed to fetch track stats';
            } else {
                track_stats = data;
                // timeline_data = data.timeline_data.map(item => ({
                //     date: new Date(item.date),
                //     total_minutes_played: parseInt((item.total_ms_played / 60000).toFixed(2)),
                //     total_ms_played: item.total_ms_played,
                //     play_count: item.play_count
                // }));
            }
        } catch (err) {
            error = err;
        }
    }

    function fillMissingDates(data) {
        // Get all unique dates from existing data (optional)
        // const existingDates = new Set(data.timeline_data.map(item => item.date));

        // Create a range of dates from first_played to last_played (inclusive)
        const startDate = new Date(data.first_played);
        const endDate = new Date(data.last_played);

        const allDates = [];
        let currentDate = startDate;
        while (currentDate <= endDate) {
            allDates.push(currentDate.toISOString().split('T')[0]); // Extract date part (dd-mm-yyyy)
            currentDate.setDate(currentDate.getDate() + 1); // Increment date by 1 day, move to next day
        }

        // Map existing data and format, fill in missing dates with formatted data
        return allDates.map(date => {
            const existingItem = data.timeline_data.find(item => item.date === date);
            return existingItem ? { // If existing item exists, use existing data and format existing properties
                date: new Date(existingItem.date),
                total_minutes_played: parseInt((existingItem.total_ms_played / 60000).toFixed(2)),
                total_ms_played: existingItem.total_ms_played,
                play_count: existingItem.play_count
            } : { // If no existing item, create new object with date and zero values, format date
                date: new Date(date),
                total_minutes_played: 0,
                total_ms_played: 0,
                play_count: 0
            };
        });
    }

    $effect(() => {
        fetchTrackStats().then(() => {
            timeline_data = fillMissingDates(track_stats);
        });
    });
</script>


{#if error}
    <p style="color: darkred">{error}</p>
{:else}

    <div>
        {#if timeline_data.length > 0}
            <D3Chart {timeline_data}/>
        {/if}


        <p> Total plays: {track_stats.total_plays}</p>
        <p>Total time played: {(track_stats.total_ms_played / 3600000).toFixed(2)} hours</p>
        <p>First played: {new Date(track_stats.first_played).toLocaleDateString()}</p>    
        <p>Last played: {new Date(track_stats.last_played).toLocaleDateString()}</p>
    </div>

{/if}


<style>

</style>