<script lang="ts">
	import CategorySelector from '../components/CategorySelector.svelte';
	import { storeUser } from '$modules/user/store.svelte';
	import { has_perm } from '$liwe3/utils/utils';
	import Button from '$liwe3/components/Button.svelte';
	import Modal from '$liwe3/components/Modal.svelte';
	import CategoryAdmin from '../components/CategoryAdmin.svelte';
	import type { FormField } from '$liwe3/components/FormCreator.svelte';

	interface Props {
		name: string;
		value?: string;
		_v: any;
		field: FormField;

		onchange?: (name: string, value: string) => void;
	}

	let { name, value = '', onchange, _v, field }: Props = $props();

	let showEditCategs = $state(false);
	let count = $state(0);

	const onChange = (id: string) => {
		onchange?.(name, id);
	};

	const openEditCategs = () => {
		showEditCategs = true;
	};
</script>

<div class="container">
	{#key count}
		<CategorySelector {name} {value} {_v} {field} onchange={onChange} />
	{/key}
	{#if has_perm(storeUser, 'category.editor')}
		<Button size="xs" variant="outline" mode="success" onclick={openEditCategs}>Edit</Button>
	{/if}
</div>

{#if showEditCategs}
	<Modal
		title="Edit Categories"
		oncancel={() => {
			showEditCategs = false;
			count++;
		}}
		onclose={() => {
			showEditCategs = false;
			count++;
		}}
	>
		<CategoryAdmin />
	</Modal>
{/if}

<style>
	.container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
