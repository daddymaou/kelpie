<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
</script>

<Seo
	title="Privacy"
	description="What this documentation site collects, and what Kelpie the library never does with your data."
	path="/legal/privacy"
	robots="index,follow"
/>
<main id="main-content" class="page page-narrow">
	<header class="page-head">
		<p class="eyebrow">LEGAL · PRIVACY</p>
		<h1 class="page-title">Privacy, <em>in plain terms.</em></h1>
		<p class="page-lede">This page covers the documentation website you are reading. It does not cover your own self-hosted Kelpie server, which you control.</p>
	</header>
	<section class="prose">
		<h2>The library</h2>
		<p>
			Kelpie the library has no telemetry, no analytics callback, and no phone-home step. Data leaves the device
			only when you configure a transport and the engine syncs — to an endpoint you specify. Storage is your
			chosen adapter; for the browser it is IndexedDB by default.
		</p>
		<h2>This website</h2>
		<p>
			This site is a static, prerendered documentation site. It sets a local preference for your chosen theme and a
			small list of recent searches, both stored in your browser's local storage. Neither is transmitted anywhere.
			There are no third-party trackers and no advertising.
		</p>
		<h2>Your server, your data</h2>
		<p>
			When you self-host Kelpie, the database, backups, and access logs are entirely under your control. Questions
			about that data are questions for your deployment, not for this site.
		</p>
		<h2>Contact</h2>
		<p>Privacy questions can be raised on the project's issue tracker.</p>
	</section>
</main>
