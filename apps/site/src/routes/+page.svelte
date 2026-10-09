<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ArtImage from '$lib/components/ArtImage.svelte';
	import CrackDivider from '$lib/components/CrackDivider.svelte';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import { art } from '$lib/art';
	import { siteDescription } from '$lib/site';

	const sample = `import { Kelpie, openIndexedDbStore, createHttpSyncTransport } from '@kelpie/core';

const kelpie = new Kelpie({
  deviceId: 'browser_a1b2',
  schemaVersion: 2,
  store: await openIndexedDbStore('field-notes'),
  transport: createHttpSyncTransport({
    baseUrl: 'https://sync.example.com',
    getToken: () => localStorage.getItem('token')
  })
});

await kelpie.insert('notes', {
  id: 'n_01H8Z',
  title: 'Tide tables',
  body: 'Write locally. Reconcile later.'
});

const notes = await kelpie.query({ table: 'notes' });`;
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
			<p class="eyebrow"><span class="status-dot"></span> LOCAL FIRST · APACHE-2.0 · SELF-HOSTED</p>
			<h1>Your data<br />has somewhere<br /><em>to go.</em></h1>
			<p class="hero-description">
				Kelpie is a TypeScript sync engine you run yourself. Writes stay local; push and pull follow a small, typed
				protocol you can read in an afternoon.
			</p>
			<div class="hero-actions">
				<a class="button-primary" href="/docs/library/quick-start">Read the quick start <span aria-hidden="true">↗</span></a>
				<a class="text-link" href="/playground">Try the playground <span aria-hidden="true">→</span></a>
			</div>
		</div>
		<div class="hero-caption">Sync for web clients — React and Svelte adapters included.</div>
	</section>

	<section class="landing-intro">
		<div class="section-label">01 / THE DEFAULT</div>
		<div>
			<h2>Connection is a condition.<br /><span>Not a prerequisite.</span></h2>
			<p>
				<code>@kelpie/core</code> owns the hybrid logical clock, the local store, the outbound queue, and the sync
				loop. A Hono server appends mutations to Postgres — or memory, in development — and pages them by cursor.
				Your interface never waits on a round trip to feel alive.
			</p>
		</div>
	</section>
	<CrackDivider />

	<section class="feature-grid" aria-label="How Kelpie works">
		<article>
			<span class="feature-number">01</span>
			<h3>Local by default</h3>
			<p>Reads and writes land in local storage first. Every mutation is typed, ordered, and durable before the network is ever involved.</p>
		</article>
		<article>
			<span class="feature-number">02</span>
			<h3>Conflicts, named</h3>
			<p>Pick a resolution policy per collection, inspect what diverged, and keep the final word with your domain rules — not a timestamp.</p>
		</article>
		<article>
			<span class="feature-number">03</span>
			<h3>TypeScript through</h3>
			<p>Schemas, migrations, adapters, and lifecycle hooks are all typed. No opaque payloads crossing the boundary between your app and its data.</p>
		</article>
	</section>

	<section class="landing-intro">
		<div class="section-label">02 / THE SURFACE</div>
		<div>
			<h2>Three packages.<br /><span>One small idea.</span></h2>
			<p>
				The client engine, a self-hostable server, and a deterministic simulator for tests and demos. React and
				Svelte adapters sit on top; Vue remains a documented stub.
			</p>
			<CodeBlock language="ts" title="kelpie.ts">{sample}</CodeBlock>
			<div class="playground-controls">
				<a class="button-ghost" href="/docs/library/what-is-kelpie">How it works <span aria-hidden="true">→</span></a>
				<a class="text-link" href="/examples">See runnable examples <span aria-hidden="true">→</span></a>
			</div>
		</div>
	</section>

	<CrackDivider />
	<section class="page" style="padding-top:64px;padding-bottom:40px">
		<div class="page-grid">
			<div class="page-card">
				<h3>@kelpie/core</h3>
				<p>Engine, IndexedDB adapter, HTTP transport, HLC, resolver, and conflict hooks.</p>
			</div>
			<div class="page-card">
				<h3>@kelpie/server</h3>
				<p>Hono endpoints, JWT/JWKS auth, rate limits, idempotent mutation ids, and materialized row state.</p>
			</div>
			<div class="page-card">
				<h3>@kelpie/sim</h3>
				<p>Deterministic two-device simulation with partition control — powers the playground and test suite.</p>
			</div>
		</div>
	</section>

	<section class="landing-bottom">
		<p class="eyebrow">OPEN SOURCE</p>
		<h2>Free to use.<br /><em>Free to host.</em></h2>
		<a class="button-primary" href="/pricing">Pricing &amp; license <span aria-hidden="true">↗</span></a>
	</section>
</main>
