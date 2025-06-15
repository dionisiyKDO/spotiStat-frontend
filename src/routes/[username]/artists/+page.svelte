<script lang="ts">
	import type { PageProps } from './$types';
	import D3Chart from "$lib/stats/TimelineChart.svelte";
	import {
		fetchArtistStats,
		fetchArtists,
		fetchPlayedTracks,
		type TopArtist,
		type ArtistStats,
		type ArtistTrack,
	} from "./load";

	// Props
	let { data }: PageProps = $props();
	const username = data.username;

	// State
	let artist = $state("塞壬唱片-MSR");
	let searchInput = $state("塞壬唱片-MSR");
	let showSuggestions = $state(false);
	let selectedIndex = $state(-1); // -1 means no selection

	// Computed values
	let artistsReq = $derived(fetchArtists(username));
	let artistStatsReq = $derived(fetchArtistStats(username, artist));
	let playedTracksReq = $derived(fetchPlayedTracks(username, artist));

	// Get top 4 artists or filter based on search input
	function getDisplayArtists(artists: TopArtist[]): TopArtist[] {
		const input = searchInput.toLowerCase().trim();
		
		if (!input) {
			return artists.slice(0, 4);
		}
		
		return artists
			.filter(artistItem => 
				artistItem.artist.toLowerCase().includes(input)
			)
			.slice(0, 4);
	}

	// Event handlers
	function selectArtist(artistItem: TopArtist): void {
		showSuggestions = false;
		selectedIndex = -1;
		artist = artistItem.artist;
		searchInput = artistItem.artist;
	}

	function handleKeyDown(event: KeyboardEvent, artists: TopArtist[]): void {
		showSuggestions = true;
		
		const displayArtists = getDisplayArtists(artists);
		
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = selectedIndex < displayArtists.length - 1 ? selectedIndex + 1 : 0;
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : displayArtists.length - 1;
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < displayArtists.length) {
					selectArtist(displayArtists[selectedIndex]);
				}
				break;
			case 'Escape':
				showSuggestions = false;
				selectedIndex = -1;
				break;
			default:
				selectedIndex = -1;
		}
	}

	function handleFocus(): void {
		showSuggestions = true;
		selectedIndex = -1;
	}

	function handleBlur(): void {
		setTimeout(() => {
			showSuggestions = false;
			selectedIndex = -1;
		}, 150); // timeout for mouse click to get through
	}

	// Utility functions
	function formatDuration(milliseconds: number): string {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;

		if (milliseconds >= 3600000) {
			// Rare case: longer than 1 hour
			const hours = milliseconds / 3600000;
			return `${hours.toFixed(2)} hours`;
		} else {
			// Default for 1–5 min (and most songs)
			return seconds === 0
				? `${minutes}m`
				: `${minutes}m${seconds}s`;
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString();
	}
</script>

<section class="max-w-6xl mx-auto p-8">
	<!-- Artist Search -->
	{#await artistsReq}
		<div class="flex justify-center items-center p-8">
			<p class="text-(--secondary-text)">Loading artists...</p>
		</div>
	{:then artists}
		<header class="mb-8">
			<h1 class="text-3xl font-semibold mb-4 text-(--primary-text)">Artist Stats</h1>
			
			<div class="relative mb-4">
				<input
					class="input"
					type="text"
					placeholder="Search artist..."
					bind:value={searchInput}
					onfocus={handleFocus}
					onblur={handleBlur}
					onkeydown={(e) => handleKeyDown(e, artists)}
				/>

				{#if showSuggestions}
					{@const displayArtists = getDisplayArtists(artists)}
					{#if displayArtists.length > 0}
						<ul class="w-96 absolute top-full left-0 right-0 bg-(--surface) border border-(--border) rounded-md mt-1 max-h-56 overflow-y-auto z-10 shadow-lg">
							{#each displayArtists as artistItem, i (artistItem.artist)}
								<li class="border-b border-(--border) last:border-b-0">
									<button
										type="button"
										class={`w-full text-left p-3 border-none text-(--primary-text) cursor-pointer transition-colors duration-200 ${selectedIndex === i ? 'bg-(--surface-hover)' : 'bg-transparent'}`}
										onclick={() => selectArtist(artistItem)}
									>
										<div class="flex justify-between items-center">
											<div>
												<div class="font-medium">{artistItem.artist}</div>
											</div>
											<div class="text-sm text-(--secondary-text)">
												{artistItem.total_hours.toFixed(1)}h
											</div>
										</div>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
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
		<section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6 mb-10">
	
			<!-- Total Plays -->
			<div class="col-span-1 md:col-span-2 bg-(--surface) shadow rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text)">Total Plays</h2>
				<p class="text-2xl font-semibold mt-1">{artistStats.total_plays.toLocaleString()}</p>
			</div>

			<!-- Total Time Played -->
			<div class="col-span-1 md:col-span-2 bg-(--surface) shadow rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text)">Total Time Played</h2>
				<p class="text-2xl font-semibold mt-1">{formatDuration(artistStats.total_ms_played)}</p>
			</div>

			<!-- Distinct Days Played -->
			<div class="col-span-1 md:col-span-2 bg-(--surface) shadow rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text)">Distinct Days Played</h2>
				<p class="text-xl font-semibold mt-1">{artistStats.distinct_days_played}</p>
			</div>

			<!-- First Play -->
			<div class="col-span-1 md:col-span-3 bg-(--surface) shadow rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text)">First Play</h2>
				<p class="text-xl font-semibold mt-1">{formatDate(artistStats.first_played)}</p>
			</div>

			<!-- Average playtime per play -->
			<div class="col-span-1 sm:col-span-2 md:col-span-3 bg-(--surface) shadow rounded-xl p-4">
				<h2 class="text-sm text-(--secondary-text)">Average playtime per play</h2>
				<p class="text-2xl font-semibold mt-1">{formatDuration(artistStats.avg_playtime_per_play)}</p>
			</div>
		</section>

		<!-- Timeline Chart -->
		{#if artistStats.timeline_data?.length > 0}
			<section class="mt-10">
				<div class="bg-(--surface) shadow rounded-xl p-4">
					<h2 class="text-sm text-(--secondary-text) mb-1 ml-4">Minutes of artist played per day</h2>
					<D3Chart timeline_data={artistStats.timeline_data} />
				</div>
			</section>
		{/if}

		<!-- Artist Tracks List -->
		{#await playedTracksReq}
			<div class="flex justify-center items-center p-8">
				<p class="text-(--primary-text)">Loading artist tracks...</p>
			</div>
		{:then playedTracks}
			{#if playedTracks && playedTracks.length > 0}
				<section class="mt-10">
					<div class="bg-(--surface) shadow rounded-xl p-4">
						<h2 class="text-lg font-semibold mb-4 text-(--primary-text)">Tracks by {artistStats.artist_name}</h2>
						<div class="space-y-3">
							{#each playedTracks as track (track.spotify_track_uri)}
								<div class="flex justify-between items-center p-3 bg-(--background) rounded-lg border border-(--border)">
									<div class="flex-1">
										<h3 class="font-medium text-(--primary-text)">{track.track_name}</h3>
									</div>
									<div class="flex gap-4 text-sm text-(--secondary-text)">
										<div class="w-22 text-right">
											<div class="font-medium">{track.play_count} plays</div>
										</div>
										<div class="w-22 text-right">
											<div class="font-medium">{formatDuration(track.total_ms_played)}</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</section>
			{/if}
		{/await}
	{/await}
</section>