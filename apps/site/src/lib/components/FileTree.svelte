<script lang="ts">
	let { items }: { items: string[] } = $props();
</script>
<ul class="file-tree" aria-label="File tree">
	{#each items as item}
		<li>{item}</li>
	{/each}
</ul>
