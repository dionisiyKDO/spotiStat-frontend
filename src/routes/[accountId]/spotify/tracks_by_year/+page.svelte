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


<div class="mt-4">
    <h2 class="text-3xl font-semibold mb-2 inline-block">Tracks by year</h2>
    
    <!-- Question mark with hover effect -->
    <div class="relative inline-block group">
        <i
            class="question-mark fa fa-question-circle ml-2 text-gray-500 hover:text-emerald-500 transition duration-100 ease-in-out"
        ></i>

        <!-- Popup content on hover -->
        <div
            class="popup-content hidden absolute left-0 mt-2 w-72 p-3 rounded-lg bg-black border border-gray-200 z-10"
        >
            <p>
                This line chart shows the number of tracks in your saves released in each year, showing your preferences by time range.
            </p>
            <p class="mt-2 opacity-50">
                you can click on chart for selecting a year to search
            </p>
        </div>
    </div>
</div>


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


<style>
    .question-mark:hover + .popup-content {
        display: block;
    }
</style>
