<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CategorySelector from '../components/CategorySelector.svelte';
	import { userStore } from '$modules/user/store.svelte';
	import { has_perm } from '$liwe3/utils/utils';
	import Button from '$liwe3/components/Button.svelte';
	import Modal from '$liwe3/components/Modal.svelte';
	import CategoryManager from '../components/CategoryManager.svelte';

	export let value: string = '';

	let showEditCategs = false;
	let count = 0;

	const dispatch = createEventDispatcher();

	const onChange = (e: CustomEvent) => {
		value = e.detail.id;

		dispatch('change', value);
	};

	const openEditCategs = () => {
		showEditCategs = true;
	};
</script>

<div class="container">
	{#key count}
		<CategorySelector {value} on:change={onChange} />
	{/key}
	{#if has_perm($userStore, 'category.editor')}
		<Button size="xs" variant="outline" mode="success" on:click={openEditCategs}>Edit</Button>
	{/if}
</div>

{#if showEditCategs}
	<Modal
		on:cancel={() => {
			showEditCategs = false;
			count++;
		}}
	>
		<CategoryManager />
	</Modal>
{/if}

<style>
	.container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
