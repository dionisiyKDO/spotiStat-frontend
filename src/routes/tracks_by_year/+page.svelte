<script>
    import D3Chart from './D3Chart.svelte';
    import SearchTrack from './SearchTrack.svelte';

    let year = $state(1976);
</script>


<div class="section">
    <D3Chart year={(value) => { year = value; }} />

    <SearchTrack year={year} />
</div>


<style>
    .section {
        margin-bottom: 2rem;
    }
</style>
