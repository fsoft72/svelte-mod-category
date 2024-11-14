<script lang="ts">
	import SelectTree from '$liwe3/components/SelectTree.svelte';
	import type { FormField } from '$liwe3/components/FormCreator.svelte';
	import { storeCategory } from '../store.svelte';
	import { onMount } from 'svelte';

	interface Props {
		field: FormField;

		name: string;

		value?: string;

		// dependency injection
		_v: (field: FormField) => any;

		// events
		onchange: (name: string, value: any, field: FormField) => void;
	}

	let { field, name, value = '', onchange, _v }: Props = $props();
	let isReady = $state(false);

	const onSelect = (value: string) => {
		onchange(name, value, field);
	};

	onMount( async () => {
		await storeCategory.load();
		isReady = true;
	});

</script>
{#if (isReady)}
	<SelectTree tree={storeCategory.tree()} {value} onchange={onSelect} />
{:else}
	<div>Loading...</div>
{/if}
