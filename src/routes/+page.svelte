<script>
    import { goto } from "$app/navigation";

    let route = $state("");

    function stalk(){
        goto(`/${route}`)
    }
</script>

<div class="min-h-screen min-w-screen flex items-center justify-center">
    <div class="flex flex-col items-center">
           
        <input placeholder="Write whoms you want to stalk" class="input text-center" bind:value={route}>
        <button class="link w-26" onclick={stalk}>Let's Stalk</button>
    
   </div>    
</div>


<!-- 

TODO: handle no data
TODO: normal logging in
TODO: Track stats - input more pleasant, keys navigation in dropdown
TODO: Track stats - chart x axis and overall
TODO: navbar trackstats and artists stats
TODO: in track and artist stats selecting the artist and track more thoughtfull make
    maybe suggest the most popular tracks and artists as images?
TODO: maybe track pictures request
TODO: artist - fetch artists, not tracks
TODO: make skeletons for all components
TODO: write redirect logic to land/ or dashboard/
TODO: upload history, in args put username 
TODO: Genre Distribution to dashboard


src/routes/
├── +layout.svelte                  // Global shell: nothing cause of minimalistic landing page
├── +page.svelte                    // Landing page: tect input what user stats to see
│
├── login/+page.svelte              // Username-password login (non-Spotify)
├── login/+layout.svelte            // True Global shell
├── register/+page.svelte           // Register page
├── connect/spotify/+page.svelte    // OAuth Spotify connect (optional)
│
├── [username]/+layout.svelte       // Auth layout (top nav, user context)
├── [username]/+page.svelte         // Personal dashboard hub
│                                   // - Summary cards
│                                   // - Entry points to deeper stats
│                                   // - Example stat cards:
│                                   //     - Total time listened
│                                   //     - Top artist last year
│                                   //     - Listening streaks
│
├── [username]/upload/+page.svelte  // Upload JSON listening history
│
├── [username]/artists/+page.svelte // Input: search/select artist
│                                   // Output:
│                                   //   - Graph of listening over time
│                                   //   - First/last played
│                                   //   - Total time & count
│
├── [username]/tracks/+page.svelte  // Input: search/select track
│                                   // Output:
│                                   //   - Graph of listening over time
│                                   //   - First/last played
│                                   //   - Total time & count
│                                   //   - Track meta data
│
├── dashboard/compare/+page.svelte  // (Planned) Compare two users’ stats side-by-side
│
│
│
│
│
├── lib/track/                      // Graphs for Track stats page
│   ├── TimelineChart.svelte
├── lib/artist/                     // Graphs for Artist stats page
│   ├── TimelineChart.svelte
├── lib/dashboard/                  // Graphs for Dashboard page
│   ├── TimelineChart.svelte
│   ├── BarChart.svelte
│
├── lib/skeletons/                  // Skeleton components per page (planned)
│   ├── SummarySkeleton.svelte
│   ├── TrackStatSkeleton.svelte
│   ├── ArtistSkeleton.svelte
│   └── GraphSkeleton.svelte

-->