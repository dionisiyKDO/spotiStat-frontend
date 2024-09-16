<script>
    import D3Chart from './D3Chart.svelte';
    import SearchTrack from './SearchTrack.svelte';
</script>

<div class="section">
    <h2>Tracks by year</h2>
    <D3Chart />
</div>
<div class="section">
    <SearchTrack />
</div>

<style>
    .section {
        margin-bottom: 2rem;
    }
</style>
