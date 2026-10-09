<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import CrackDivider from '$lib/components/CrackDivider.svelte';
</script>

<Seo
	title="Pricing & license"
	description="Kelpie is free and open source under Apache-2.0. Self-host it. There are no tiers and no hosted plan."
	path="/pricing"
/>
<main id="main-content" class="page page-narrow">
	<header class="page-head">
		<p class="eyebrow">PRICING</p>
		<h1 class="page-title">Free, and <em>stated plainly.</em></h1>
		<p class="page-lede">
			Kelpie is open source under Apache-2.0. You run it on infrastructure you control. There is no cloud plan,
			no seat count, and no metered sync. That is the whole model for now.
		</p>
	</header>

	<table class="pricing-table">
		<thead>
			<tr><th>PLAN</th><th>PRICE</th><th>WHAT YOU GET</th></tr>
		</thead>
		<tbody>
			<tr>
				<td><strong>Self-hosted</strong></td>
				<td><span class="price-free">$0</span></td>
				<td>
					The full engine, server, CLI, React and Svelte adapters, and the simulator. Apache-2.0, no attribution
					required beyond the license terms.
				</td>
			</tr>
			<tr>
				<td><strong>Hosted</strong></td>
				<td><span class="muted">Not offered</span></td>
				<td>
					There is no hosted Kelpie service. If that changes, it will be announced here with the license and terms
					that apply — not retroactively applied to your self-hosted deployment.
				</td>
			</tr>
		</tbody>
	</table>

	<p class="muted-note">
		<strong>Staying that way for now.</strong> Kelpie has no billing, no multi-tenant control plane, and no cloud
		dependency. Self-hosting means exactly what it says: the server, database, and object of trust are yours.
	</p>

	<CrackDivider />
	<section class="prose" style="margin-top:34px">
		<h2>What self-hosting involves</h2>
		<p>
			You run one Hono server against a Postgres database you own. Authentication is bring-your-own JWT — either a
			shared secret or a JWKS endpoint you configure. Authorization is a row-level permission hook that receives the
			verified claims and the mutation, and decides whether it is allowed.
		</p>
		<p>
			Nothing leaves your infrastructure unless you configure a transport to send it somewhere. The local-first
			engine keeps working with no server at all; the server only exists to reconcile devices.
		</p>
		<h2>License at a glance</h2>
		<ul>
			<li>Apache License 2.0 — permissive, commercial use allowed.</li>
			<li>No contributor license agreement that reassigns your copyright.</li>
			<li>No “open core” split withheld behind a private edition.</li>
		</ul>
	</section>
</main>
