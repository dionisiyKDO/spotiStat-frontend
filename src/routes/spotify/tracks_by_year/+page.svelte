<script>
    import D3Chart from './D3Chart.svelte';
    import SearchTrack from './SearchTrack.svelte';

    let year = $state(1976);
</script>


<div class="">

    <h2 class="py-1 text-3xl font-semibold">Tracks by year</h2>
    <p class="inline-block" >This line chart shows the number of tracks in your saves released in each year, showing your preferences by time range. </p>
    <p class="inline-block" style="opacity: 0.5;">(you can click on chart for selecting a year to search)</p>
    
    <D3Chart year={(value) => { year = value; }} />

    <SearchTrack year={year} />

</div>
