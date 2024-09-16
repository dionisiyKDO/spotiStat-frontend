<script>
    async function fetchTracksByYear() {
        try {
            const response = await fetch(`/api/search_track?year=${year}`);
            if (!response.ok) {
                const data = await response.json();
                error = data.error || 'Something went wrong!';
            } else {
                const data = await response.json();
                tracksByYear = data.tracks_by_year;
            }
        } catch (err) {
            error = 'Error fetching tracks by year';
        }
    }
</script>

<div class="section">
    
</div>


<style>

</style>