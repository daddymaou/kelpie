<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import CrackDivider from '$lib/components/CrackDivider.svelte';
</script>

<Seo
	title="About"
	description="Why Kelpie exists, the principles it holds to, and what it deliberately refuses to become."
	path="/about"
/>
<main id="main-content" class="page page-narrow">
	<header class="page-head">
		<p class="eyebrow">ABOUT</p>
		<h1 class="page-title">Software for the <em>thin signal.</em></h1>
		<p class="page-lede">
			Kelpie is an open-source sync engine for TypeScript apps that should keep working when the network does not.
			It is a small tool with a narrow job, and it intends to stay that way.
		</p>
	</header>

	<section class="prose">
		<h2>Why it exists</h2>
		<p>
			Most web applications still treat a distant server as the source of truth for every interaction. That is
			simple until the connection is slow, unstable, or gone — which is to say, most of the time, for many people.
			Kelpie starts from the other end: writes land locally, and synchronization is a separate, inspectable process.
		</p>
		<h2>Principles</h2>
		<ul>
			<li><strong>Local first.</strong> Reads and writes do not wait on a round trip.</li>
			<li><strong>Explicit sync.</strong> Queued, acknowledged, rejected, and blocked changes have distinct states.</li>
			<li><strong>Intentional conflicts.</strong> Resolution is a per-collection decision, not a global policy.</li>
			<li><strong>Typed boundaries.</strong> Schemas, storage, and transport are designed for TypeScript.</li>
			<li><strong>Application-owned authority.</strong> Auth, authorization, and domain rules stay yours.</li>
		</ul>
		<CrackDivider />
		<h2>What it refuses to be</h2>
		<p>
			Kelpie is not a hosted database, an identity provider, or a source of AI features. There is no cloud
			control plane, no billing, and no multi-tenant product hiding in the repository. You run the server; the
			object of trust is yours.
		</p>
		<h2>License</h2>
		<p>
			Apache License 2.0. Commercial use is allowed, attribution stays with the contributors, and there is no
			contributor agreement that reassigns your copyright.
		</p>
	</section>
</main>
