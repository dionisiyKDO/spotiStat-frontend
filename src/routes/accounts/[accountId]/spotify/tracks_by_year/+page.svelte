<script lang="ts">
    import D3Chart from "./D3Chart.svelte";
    import SearchTrack from "./SearchTrack.svelte";

    let year = $state(1976);

    interface TracksByYear {
        count: number;
        release_date: string;
    }

    async function fetchTracksByYear(): Promise<TracksByYear[] | null> {
        try {
            const response = await fetch("/api/spotify/tracks_by_year");
            if (!response.ok) {
                const data = await response.json();
                const error = data.error || "Failed to fetch tracks by year";
                console.log(error);
                return null;
            }
            const data = (await response.json()) as {
                tracks_by_year: TracksByYear[];
            };
            const tracksByYear: TracksByYear[] = data.tracks_by_year;
            tracksByYear.sort(function (a, b) {
                return a.release_date - b.release_date;
            }); // sort by release date
            for (let i = 0; i < tracksByYear.length; i++) {
                tracksByYear[i].release_date = new Date(
                    tracksByYear[i].release_date
                );
            } // convert to date type

            return tracksByYear;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    let tracksByYearReq = $derived(fetchTracksByYear());
</script>

<div class="">
    <h2 class="py-1 text-3xl font-semibold">Tracks by year</h2>
    <p class="inline-block">
        This line chart shows the number of tracks in your saves released in
        each year, showing your preferences by time range.
    </p>
    <p class="inline-block" style="opacity: 0.5;">
        (you can click on chart for selecting a year to search)
    </p>

    {#await tracksByYearReq}
        <p class="loading">Loading...</p>
    {:then tracksByYear}
        <D3Chart
            year={(value) => {
                year = value;
            }}
            {tracksByYear}
        />
    {/await}

    <SearchTrack {year} />
</div>
