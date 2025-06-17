<script>
    import { goto } from "$app/navigation";

    let route = $state("");

    function stalk() {
        goto(`/${route}`);
    }
</script>

<div class="min-h-screen min-w-screen flex items-center justify-center">
    <div class="flex flex-col items-center">
        <input
            placeholder="Write whoms you want to stalk"
            class="input text-center"
            bind:value={route}
        />
        <button
            class="px-2 py-1 m-2 inline-block text-(--primary) hover:text-(--primary-hover) rounded-lg border-2 border-(--primary) hover:border-(--primary-hover) transition-all duration-200 ease-in-out box-border w-26"
            onclick={stalk}>Let's Stalk</button
        >
    </div>
</div>

<!-- 

TODO: handle no data
TODO: maybe track pictures request
TODO: make skeletons for all components
TODO: write redirect logic to land/ or dashboard/
TODO: Genre Distribution to dashboard
TODO: Maybe most skipped artists
TODO: shuffle stats
TODO: upload history, in args put username 
TODO: uplaod history with actual files uploading
TODO: 
TODO: 
TODO: Overhaul and redesign of the /compare page
TODO: !! Refactor dashboard/TimelineChart   - It became cluttered
TODO: !! Refactor dashboard/BarChart        - It became cluttered
TODO: Think how to handle header with compare page
TODO: Overall compare apge brought kind of disbalance to frontend


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
