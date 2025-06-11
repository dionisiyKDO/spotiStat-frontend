<script lang="ts">
	import type { PageProps } from './$types';
	import D3Chart from "$lib/track/TimelineChart.svelte";
	import {
		fetchTrackStats,
		fetchTracks,
		type Tracks,
	} from "./load";

	// Props  
	let { data }: PageProps = $props();
	const username = data.username;

	// State
	let track_id = $state("29fFAKTm2Bvw9KwyxGtYgV");
	let searchInput = $state("Tsubasa by ナナホシ(CV:若山詩音)");
	let filteredTracks: Tracks[] = $state([]);
	let showSuggestions = $state(false);

	// Constants
	const MAX_SEARCH_RESULTS = 4;
	const TRACK_MATCH_SCORE = 7;
	const ARTIST_MATCH_SCORE = 3;
	const SUGGESTION_HIDE_DELAY = 200;
	const DEBOUNCE_DELAY = 300;

	// Computed values
	let trackStatsReq = $derived(fetchTrackStats(username, track_id));
	let tracksReq = $derived(fetchTracks(username));

	// Search functionality
	function calculateRelevance(track: Tracks, searchTerms: string[]): number {
		let score = 0;
		const trackNameLower = track.track_name.toLowerCase();
		const artistLower = track.artist.toLowerCase();
		
		searchTerms.forEach((term) => {
			if (trackNameLower.includes(term)) {
				score += TRACK_MATCH_SCORE;
			}
			if (artistLower.includes(term)) {
				score += ARTIST_MATCH_SCORE;
			}
		});
		
		return score;
	}

	function filterTracks(tracks: Tracks[]): void {
		const inputLower = searchInput.toLowerCase().trim();
		
		if (!inputLower) {
			filteredTracks = [];
			return;
		}

		const searchTerms = inputLower.split(/\s+/);

		filteredTracks = tracks
			.map((track) => ({
				track,
				relevance: calculateRelevance(track, searchTerms),
			}))
			.filter((item) => item.relevance > 0)
			.sort((a, b) => b.relevance - a.relevance)
			.slice(0, MAX_SEARCH_RESULTS)
			.map((item) => item.track);
	}

	// Event handlers
	let debounceTimeout: ReturnType<typeof setTimeout>;

	function handleSearchFocus(): void {
		showSuggestions = true;
	}

	function handleSearchBlur(): void {
		setTimeout(() => {
			showSuggestions = false;
		}, SUGGESTION_HIDE_DELAY);
	}

	function handleSearchInput(tracks: Tracks[]): void {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => filterTracks(tracks), DEBOUNCE_DELAY);
	}

	function selectTrack(track: Tracks): void {
		track_id = track.spotify_track_uri.replace("spotify:track:", "");
		searchInput = `${track.track_name} by ${track.artist}`;
		showSuggestions = false;
	}

	// Utility functions
	function formatDuration(milliseconds: number): string {
		const hours = milliseconds / 3600000;
		const minutes = milliseconds / 60000;
		
		return hours > 3 
			? `${hours.toFixed(2)} hours`
			: `${minutes.toFixed(2)} minutes`;
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString();
	}
</script>

<section class="max-w-6xl mx-auto p-8">
	<!-- Track Search -->
	{#await tracksReq}
		<div class="flex justify-center items-center p-8">
			<p class="text-(--secondary-text)">Loading tracks...</p>
		</div>
	{:then tracks}
		<header class="mb-8">
			<h1 class="text-3xl font-semibold mb-4 text-(--primary-text)">Track Stats</h1>
			
			<div class="relative mb-4">
				<input
					class="input"
					type="text"
					placeholder="Search track or artist..."
					bind:value={searchInput}
					onfocus={handleSearchFocus}
					onblur={handleSearchBlur}
					oninput={() => handleSearchInput(tracks)}
				/>

				{#if showSuggestions && filteredTracks.length > 0}
					<ul class="absolute top-full left-0 right-0 bg-(--surface) border border-(--border) rounded-md mt-1 max-h-48 overflow-y-auto z-10 shadow-lg">
						{#each filteredTracks as track (track.spotify_track_uri)}
							<li class="border-b border-(--border) last:border-b-0">
								<button
									type="button"
									class="w-full text-left p-2 bg-transparent border-none text-(--primary-text) cursor-pointer hover:bg-(--surface-hover) transition-colors duration-200"
									onclick={() => selectTrack(track)}
								>
									{track.track_name} by {track.artist}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</header>
	{/await}

	<!-- Track Statistics -->
	{#await trackStatsReq}
		<div class="flex justify-center items-center p-8">
			<p class="text-(--primary-text)">Loading track statistics...</p>
		</div>
	{:then trackStats}
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
			<div class="bg-(--surface) shadow-sm rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text) mb-1 font-medium">Total Plays</h2>
				<p class="text-xl font-semibold text-(--primary-text) mt-1">{trackStats.total_plays.toLocaleString()}</p>
			</div>
			
			<div class="bg-(--surface) shadow-sm rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text) mb-1 font-medium">Total Time Played</h2>
				<p class="text-xl font-semibold text-(--primary-text) mt-1">{formatDuration(trackStats.total_ms_played)}</p>
			</div>
			
			<div class="bg-(--surface) shadow-sm rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text) mb-1 font-medium">First Play</h2>
				<p class="text-xl font-semibold text-(--primary-text) mt-1">{formatDate(trackStats.first_played)}</p>
			</div>
			
            <!-- Useless info -->
			<!-- <div class="bg-(--surface) shadow-sm rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text) mb-1 font-medium">Last Recorded Play</h2>
				<p class="text-xl font-semibold text-(--primary-text) mt-1">{formatDate(trackStats.last_played)}</p>
			</div> -->

			<!-- Optional Add-ons -->
			<!-- <div class="bg-(--surface) shadow-sm rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text) mb-1 font-medium">Longest Streak</h2>
				<p class="text-xl font-semibold text-(--primary-text) mt-1">7 days in a row</p>
			</div>
			
			<div class="bg-(--surface) shadow-sm rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text) mb-1 font-medium">Listening Pattern</h2>
				<p class="text-xl font-semibold text-(--primary-text) mt-1">Instant favorite</p>
			</div> -->
		</section>

		<!-- Timeline Chart -->
		{#if trackStats.timeline_data?.length > 0}
			<section class="mt-10">
				<div class="bg-(--surface) shadow-sm rounded-xl p-4">
					<h2 class="text-sm text-(--secondary-text) mb-1 ml-4 font-medium">Minutes of track played per day</h2>
					<D3Chart timeline_data={trackStats.timeline_data} />
				</div>
			</section>
		{/if}
	{/await}
</section>