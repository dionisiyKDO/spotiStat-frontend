<script lang="ts">
    import { page } from "$app/stores";
    let accountId = $page.params.accountId;

</script>

<div>
    <!-- Profile related block -->
    {#await Req}
        <p class="loading">Loading...</p>
    {:then data} 
    {/await}

</div>
