<script lang="ts">
	import type { PageProps } from './$types';
	import D3Chart from "$lib/artist/TimelineChart.svelte";
	import {
		fetchArtistStats,
		fetchTracks,
		type Track,
	} from "./load";

	// Props
	let { data }: PageProps = $props();
	const username = data.username;

	// State
	let artist = $state("塞壬唱片-MSR");
	let searchInput = $state("");
	let filteredTracks: Track[] = $state([]);
	let showSuggestions = $state(false);

	// Constants
	const MAX_SEARCH_RESULTS = 4;
	const ARTIST_MATCH_SCORE = 5;
	const SUGGESTION_HIDE_DELAY = 200;

	// Computed values
	let artistStatsReq = $derived(fetchArtistStats(username, artist));
	let tracksReq = $derived(fetchTracks(username));

	// Search functionality
	function calculateRelevance(track: Track, searchTerms: string[]): number {
		let score = 0;
		const artistLower = track.artist.toLowerCase();
		
		searchTerms.forEach((term) => {
			if (artistLower.includes(term)) {
				score += ARTIST_MATCH_SCORE;
			}
		});
		
		return score;
	}

	function filterTracks(tracks: Track[]): void {
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
	function handleSearchFocus(): void {
		showSuggestions = true;
	}

	function handleSearchBlur(): void {
		setTimeout(() => {
			showSuggestions = false;
		}, SUGGESTION_HIDE_DELAY);
	}

	function handleSearchInput(tracks: Track[]): void {
		filterTracks(tracks);
	}

	function selectArtist(selectedArtist: string): void {
		showSuggestions = false;
		searchInput = selectedArtist;
		artist = selectedArtist;
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
	<!-- Artist Search -->
	{#await tracksReq}
		<div class="flex justify-center items-center p-8">
			<p class="text-(--secondary-text)">Loading tracks...</p>
		</div>
	{:then tracks}
		<header class="mb-8">
			<h1 class="text-3xl font-semibold mb-4 text-(--primary-text)">Artist Stats</h1>
			
			<div class="relative mb-4">
				<input
					class="w-96 max-w-full border border-(--border) p-2 rounded-md bg-(--surface) text-(--primary-text) focus:outline-none focus:border-(--primary-text) focus:ring-1 focus:ring-(--primary-text) focus:ring-opacity-20"
					type="text"
					placeholder="Search artist..."
					bind:value={searchInput}
					onfocus={handleSearchFocus}
					onblur={handleSearchBlur}
					oninput={() => handleSearchInput(tracks)}
				/>

				{#if showSuggestions && filteredTracks.length > 0}
					<ul class="absolute top-full left-0 right-0 bg-(--surface) border border-(--border) rounded-md mt-1 max-h-48 overflow-y-auto z-10 shadow-lg">
						{#each filteredTracks as track (track.artist)}
							<li class="border-b border-(--border) last:border-b-0">
								<button
									type="button"
									class="w-full text-left p-2 bg-transparent border-none text-(--primary-text) cursor-pointer hover:bg-(--surface-hover) transition-colors duration-200"
									onclick={() => selectArtist(track.artist)}
								>
									{track.artist}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</header>
	{/await}

	<!-- Artist Statistics -->
	{#await artistStatsReq}
		<div class="flex justify-center items-center p-8">
			<p class="text-(--primary-text)">Loading artist statistics...</p>
		</div>
	{:then artistStats}
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
			<div class="bg-(--surface) shadow-sm rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text) mb-1 font-medium">Total Plays</h2>
				<p class="text-xl font-semibold text-(--primary-text) mt-1">{artistStats.total_plays.toLocaleString()}</p>
			</div>
			
			<div class="bg-(--surface) shadow-sm rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text) mb-1 font-medium">Total Time Played</h2>
				<p class="text-xl font-semibold text-(--primary-text) mt-1">{formatDuration(artistStats.total_ms_played)}</p>
			</div>
			
			<div class="bg-(--surface) shadow-sm rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text) mb-1 font-medium">First Play</h2>
				<p class="text-xl font-semibold text-(--primary-text) mt-1">{formatDate(artistStats.first_played)}</p>
			</div>
			
			<div class="bg-(--surface) shadow-sm rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text) mb-1 font-medium">Last Recorded Play</h2>
				<p class="text-xl font-semibold text-(--primary-text) mt-1">{formatDate(artistStats.last_played)}</p>
			</div>
		</section>

		<!-- Timeline Chart -->
		{#if artistStats.timeline_data?.length > 0}
			<section class="mt-10">
				<div class="bg-(--surface) shadow-sm rounded-xl p-4">
					<h2 class="text-sm text-(--secondary-text) mb-1 ml-4 font-medium">Minutes of artist played per day</h2>
					<D3Chart
						selectedDate={(value) => {
							// Handle date selection if needed
							console.log('Selected date:', value);
						}}
						timeline_data={artistStats.timeline_data}
					/>
				</div>
			</section>
		{/if}
	{/await}
</section>