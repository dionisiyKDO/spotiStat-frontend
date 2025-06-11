<script>
    import { goto } from "$app/navigation";

    let route = $state("");


    // TODO: write redirect logic to land/ or dashboard/
    // TODO: upload history, in args put username



    // const combinedPromise = Promise.all([
    //     fetchUserInfo(),
    //     fetchCheckHistory(username),
    // ]);

    // let { data } = $props();
    // const username = data.username;
    // const spotifyLinks = [
    //     {
    //         name: "Recently played",
    //         link: `/${username}/spotify/recently_played`,
    //     },
    //     {
    //         name: "Saved tracks",
    //         link: `/${username}/spotify/saved_tracks`,
    //     },
    //     {
    //         name: "Top tracks",
    //         link: `/${username}/spotify/top/tracks`,
    //     },
    //     {
    //         name: "Top artists",
    //         link: `/${username}/spotify/top/artists`,
    //     },
    //     {
    //         name: "Tracks by year",
    //         link: `/${username}/spotify/tracks_by_year`,
    //     },
    // ];

    // const historyLinks = [
    //     {
    //         name: "Track stats",
    //         link: `/${username}/tracks`,
    //     },
    //     {
    //         name: "Artist stats",
    //         link: `/${username}/artists`,
    //     },
    //     {
    //         name: "OverView",
    //         link: `/${username}/trends`,
    //     },
    // ];
    function stalk(){
        goto(`/${route}`)
    }
</script>

<p>
    Write whoms you want to stalk:
</p>
<input bind:value={route}>
<button onclick={stalk}>Let's Stalk</button>



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
TODO: 


src/routes/
├── +layout.svelte                  // Global shell: nav bar, theme, etc.
├── +page.svelte                    // Landing page: brief description + login / register / upload
│
├── login/+page.svelte              // Username-password login (non-Spotify)
├── register/+page.svelte           // Register page
├── connect/spotify/+page.svelte    // OAuth Spotify connect (optional)
│
├── dashboard/+layout.svelte        // Auth layout (top nav, user context)
├── dashboard/+page.svelte          // Personal dashboard hub
│                                   // - Summary cards
│                                   // - Entry points to deeper stats
│                                   // - Example stat cards:
│                                   //     - Total time listened
│                                   //     - Top artist last year
│                                   //     - Listening streaks (coming soon?)
│
├── dashboard/upload/+page.svelte   // Upload JSON listening history
│
├── dashboard/track/+page.svelte    // Input: search/select track
│                                   // Output:
│                                   //   - Total plays/time
│                                   //   - First/last played
│                                   //   - Graph (plays over time)
│                                   //   - Album/artist info
│
├── dashboard/artist/+page.svelte   // Input: search/select artist
│                                   // Output:
│                                   //   - Graph of listening over time
│                                   //   - First/last played
│                                   //   - Total time & count
│
├── dashboard/trends/+page.svelte   // Hourly, daily, weekly trends
│                                   // Graphs:
│                                   //   - 0–23 hour bar chart
│                                   //   - Day-of-week bar chart
│                                   //   - Full timeline line graph
│
├── dashboard/compare/+page.svelte  // (Planned) Compare two users’ stats side-by-side
│
├── dashboard/stats/+server.ts      // Backend-only: fetch precomputed stats from extended history
│
│
│
│
│
├── lib/components/skeletons/       // Skeleton components per page
│   ├── SummarySkeleton.svelte
│   ├── TrackStatSkeleton.svelte
│   ├── ArtistSkeleton.svelte
│   └── GraphSkeleton.svelte
├── lib/components/cards/           // Stat cards & quick overviews
│   ├── StatCard.svelte
│   ├── TopTrackCard.svelte
│   └── TopArtistCard.svelte
├── lib/components/graphs/          // Reusable graphs
│   ├── LineGraph.svelte
│   ├── BarGraph.svelte
│   └── TrendGraph.svelte
├── lib/api/                        // Frontend fetchers
│   ├── getSummary.ts
│   ├── getTrackStats.ts
│   ├── getArtistStats.ts
│   └── getTrends.ts




-->