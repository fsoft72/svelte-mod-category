<script lang="ts">
	import Button from '$liwe3/components/Button.svelte';
	import DataGrid, {
		type DataGridAction,
		type DataGridField,
		type DataGridRow
	} from '$liwe3/components/DataGrid.svelte';
	import { storeCategory } from '$modules/category/store.svelte';
	import type { CategoryTreeItem } from '$modules/category/types';
	import { onMount } from 'svelte';
	import { Trash } from 'svelte-hero-icons';

	const fields: DataGridField[] = [
		{
			name: 'id',
			label: 'ID',
			type: 'text',
			hidden: true
		},
		{
			name: 'title',
			label: 'Title',
			type: 'text',
			filterable: true,
			sortable: true,
			editable: true
		},
		{
			name: 'slug',
			label: 'Slug',
			type: 'text',
			filterable: true,
			sortable: true,
			editable: true
		},
		{
			name: 'description',
			label: 'Description',
			type: 'text',
			filterable: true,
			sortable: true,
			editable: true
		},
		{
			name: 'visible',
			label: 'Visible',
			type: 'checkbox',
			align: 'center',
			filterable: true,
			sortable: true,
			editable: true
		}
	];

	const actions: DataGridAction[] = [
		{
			label: 'Delete',
			icon: Trash,
			mode: 'danger',
			onclick: (row: DataGridRow) => {
				subcategories = subcategories.filter((item) => item.id !== row.id);
			}
		}
	];

	interface Props {
		id_category: string;

		onsave: (subcategories: CategoryTreeItem[]) => void;
	}

	let { id_category, onsave }: Props = $props();
	let isReady = $state(false);
	let category: CategoryTreeItem | null | undefined = $state(null);
	let subcategories: CategoryTreeItem[] = $state([]);

	const oncelledit = (data: DataGridRow, field: string, oldValue: any, newValue: any) => {
		data[field] = newValue;
	};

	onMount(() => {
		category = storeCategory.get(id_category);
		subcategories = category?.children ?? [];

		isReady = true;
	});
</script>

{#if isReady}
	<div class="sub-cat">
		<DataGrid {fields} data={subcategories} {actions} {oncelledit} />
		<div class="buttons">
			<Button mode="success" onclick={() => onsave(subcategories)}>Save</Button>
		</div>
	</div>
{/if}

<style>
	.sub-cat {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
</style>
