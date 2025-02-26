<script lang="ts">
    import { onMount } from "svelte";
    import D3Chart from "./D3Chart.svelte";
    import SearchTrack from "./SearchTrack.svelte";

    let year = $state(1976);

    interface TrackByYear {
        count: number;
        release_date: Date;
    }

    onMount(async () => {
        const data = await fetchApi<{
            tracks_by_year: { count: number; release_date: string }[];
        }>("/api/spotify/tracks_by_year");

        if (data == null) {
            // if fatal
        }

        const tracksByYear: TrackByYear[] = data.tracks_by_year.map((track) => {
            return {
                release_date: new Date(track.release_date),
                count: track.count,
            };
        });

        tracksByYear.sort(function (a, b) {
            return Number(a.release_date) - Number(b.release_date);
        }); // sort by release date

        return tracksByYear;
    });

    async function fetchApi<T>(
        route: string,
        errorMessage: string = "Unknown error"
    ): Promise<T | null> {
        try {
            const response = await fetch(route);
            const data = await response.json();

            if (!response.ok) {
                const error = data.error || errorMessage;
                console.log(error);
                return null;
            }

            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async function fetchTracksByYear(): Promise<TrackByYear[] | null> {
        try {
            const response = await fetch("/api/spotify/tracks_by_year");
            if (!response.ok) {
                const data = await response.json();
                const error = data.error || "Failed to fetch tracks by year";
                console.log(error);
                return null;
            }

            const data = await response.json();
            const tracksByYear = data.tracks_by_year.map((track) => {
                track.release_date = new Date(track.release_date); // Update the release_date
                return track; // Return the full track object
            }) as TrackByYear[];
            
            tracksByYear.sort(function (a, b) {
                return +a.release_date - +b.release_date;
            }); // sort by release date

            return tracksByYear;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    let tracksByYearReq = $derived(fetchTracksByYear());
</script>

<div>
    <h2 class="text-3xl font-semibold mb-2 inline-block">Tracks by year</h2>

    <!-- Question mark with hover effect -->
    <div class="relative inline-block group">
        <i
            class="question-mark fa fa-question-circle ml-2 text-(--primary-text) hover:text-(--primary-hover) transition duration-100 ease-in-out"
        ></i>

        <!-- Popup content on hover -->
        <div
            class="popup-content hidden absolute left-0 mt-2 w-72 p-3 rounded-lg bg-(--surface) border border-(--border) z-10"
        >
            <p>
                This line chart shows the number of tracks in your saves
                released in each year, showing your preferences by time range.
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
    <D3Chart bind:year {tracksByYear} />
{/await}

<SearchTrack bind:year />

<style>
    .question-mark:hover + .popup-content {
        display: block;
    }
</style>
