<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ArtImage from '$lib/components/ArtImage.svelte';
	import { art } from '$lib/art';
</script>

<Seo
	title="Benchmarks"
	description="Measured Kelpie numbers, published only when they were actually run. There are no results yet, and this page says so."
	path="/benchmarks"
/>
<main id="main-content" class="page">
	<header class="page-head">
		<p class="eyebrow">BENCHMARKS</p>
		<h1 class="page-title">Numbers we <em>actually ran.</em></h1>
		<p class="page-lede">
			This page only carries results that were produced by the benchmark harness in this repository, on named
			hardware, with the command shown. It is deliberately empty rather than filled with estimates.
		</p>
	</header>

	<section class="empty-state">
		<ArtImage src={art.empty.src} alt={art.empty.alt} focalPoint={art.empty.focalPoint} tone="mono" class="search-empty-art" decorative />
		<h3>No published results yet</h3>
		<p>
			The harness exists and the methodology is written down, but no run has been recorded for this build. When a
			run is committed, its table, hardware, and command will appear here — and nowhere else.
		</p>
	</section>

	<section class="prose" style="margin-top:56px">
		<h2>Methodology</h2>
		<p>Every published result must record:</p>
		<ul>
			<li>The exact command and benchmark revision.</li>
			<li>CPU, memory, and storage of the machine it ran on.</li>
			<li>Dataset size, mutation count, and number of simulated devices.</li>
			<li>Wall-clock time and peak heap, reported as a range across repeated runs.</li>
		</ul>
		<p>
			Numbers from different machines are never averaged together, and no result is interpolated or estimated. If a
			run cannot be reproduced, it is removed.
		</p>
	</section>
</main>
