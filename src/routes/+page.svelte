<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ArtImage from '$lib/components/ArtImage.svelte';
	import CrackDivider from '$lib/components/CrackDivider.svelte';
	import { art } from '$lib/art';
	import { siteDescription } from '$lib/site';
</script>

<Seo title="Local-first sync for TypeScript" description={siteDescription} path="/" />
<main id="main-content" class="landing">
	<section class="hero">
		<ArtImage
			src={art.hero.src}
			alt={art.hero.alt}
			focalPoint={art.hero.focalPoint}
			tone={art.hero.tone}
			class="hero-art"
			decorative
		/>
		<div class="hero-copy">
			<p class="eyebrow"><span class="status-dot"></span> LOCAL FIRST. NETWORK OPTIONAL.</p>
			<h1>Your data<br />has somewhere<br /><em>to go.</em></h1>
			<p class="hero-description">Kelpie keeps TypeScript apps in step across devices, even when the internet steps out.</p>
			<div class="hero-actions">
				<a class="button-primary" href="/docs/library/quick-start">Read the quick start <span aria-hidden="true">↗</span></a>
				<a class="text-link" href="/docs/library/what-is-kelpie">How Kelpie works <span aria-hidden="true">→</span></a>
			</div>
		</div>
		<div class="hero-caption">A sync engine that stays out of your way.</div>
	</section>
	<section class="landing-intro">
		<div class="section-label">01 / A DIFFERENT DEFAULT</div>
		<div>
			<h2>Connection is a condition.<br /><span>Not a prerequisite.</span></h2>
			<p>Build for the tunnel, the airplane mode, the coffee shop that forgot its router. Kelpie writes locally first, then reconciles with care when a connection returns.</p>
		</div>
	</section>
	<CrackDivider />
	<section class="feature-grid" aria-label="How Kelpie works">
		<article><span class="feature-number">01</span><h3>Local by default</h3><p>Reads and writes happen against a local store. The interface never waits for a round trip to feel alive.</p></article>
		<article><span class="feature-number">02</span><h3>Conflicts, explained</h3><p>Choose a resolution policy per collection, inspect what changed, and keep your domain rules in charge.</p></article>
		<article><span class="feature-number">03</span><h3>TypeScript through</h3><p>Typed schemas, migrations, adapters, and lifecycle hooks. No mystery payloads between your app and its data.</p></article>
	</section>
	<section class="landing-bottom">
		<p class="eyebrow">START WITH THE SHORELINE</p>
		<h2>Small surface area.<br /><em>Room to grow.</em></h2>
		<a class="button-primary" href="/docs/library/install">Install Kelpie <span aria-hidden="true">↗</span></a>
	</section>
</main>
