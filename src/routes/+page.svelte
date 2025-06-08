<script>
    // TODO: write redirect logic to land/ or dashboard/



    // const combinedPromise = Promise.all([
    //     fetchUserInfo(),
    //     fetchCheckHistory(accountId),
    // ]);

    // let { data } = $props();
    // const accountId = data.accountId;
    // const spotifyLinks = [
    //     {
    //         name: "Recently played",
    //         link: `/${accountId}/spotify/recently_played`,
    //     },
    //     {
    //         name: "Saved tracks",
    //         link: `/${accountId}/spotify/saved_tracks`,
    //     },
    //     {
    //         name: "Top tracks",
    //         link: `/${accountId}/spotify/top/tracks`,
    //     },
    //     {
    //         name: "Top artists",
    //         link: `/${accountId}/spotify/top/artists`,
    //     },
    //     {
    //         name: "Tracks by year",
    //         link: `/${accountId}/spotify/tracks_by_year`,
    //     },
    // ];

    // const historyLinks = [
    //     {
    //         name: "Track stats",
    //         link: `/${accountId}/tracks`,
    //     },
    //     {
    //         name: "Artist stats",
    //         link: `/${accountId}/artists`,
    //     },
    //     {
    //         name: "OverView",
    //         link: `/${accountId}/trends`,
    //     },
    // ];

</script>


<!-- 

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