<script lang="ts">
	import DataGrid, {
		type DataGridButton,
		type DataGridField,
		type DataGridRow
	} from '$liwe3/components/DataGrid.svelte';
	import { onMount } from 'svelte';
	import { Plus } from 'svelte-hero-icons';
	import { storeCategory } from '../store.svelte';
	import type { CategoryTreeItem } from '../types';
	import Modal from '$liwe3/components/Modal.svelte';
	import SubCategoryManager from './subs/SubCategoryManager.svelte';

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
		},
		{
			name: 'children',
			label: 'Subcategories',
			type: 'number',
			align: 'center',
			onclick: (row: DataGridRow) => {
				manageSubcategories(row);
			},
			render: (field: CategoryTreeItem[], row: DataGridRow) => {
				return field?.length ?? 0;
			}
		},
		{
			name: 'modules',
			label: 'Modules',
			type: 'number',
			align: 'center',
			onclick: (row: DataGridRow) => {
				console.log('=== ADD MOD: ', row);
			},
			render: (field: any[], row: DataGridRow) => field?.length ?? 0
		}
	];

	const buttons: DataGridButton[] = [
		{
			label: 'Add',
			icon: Plus,
			mode: 'success',
			onclick: () => {
				console.log('Add');
			}
		}
	];

	const data: DataGridRow[] = [];
	let isReady = $state(false);
	let currCategory: CategoryTreeItem | null = $state(null);
	let openSubcategories = $state(false);

	const manageSubcategories = (row: DataGridRow) => {
		console.log('=== MANAGE SUB: ', row);

		currCategory = storeCategory.categories.find((category) => category.id == row.id)!;
		openSubcategories = true;
	};

	const onsave_subcategories = (subcategories: CategoryTreeItem[]) => {
		currCategory!.children = subcategories;
		openSubcategories = false;

		storeCategory.update(currCategory!);
	};

	onMount(() => {
		const roots = storeCategory.categories.filter((category) => category.id_parent == '');

		data.push(
			...roots.map((category: CategoryTreeItem) => ({
				id: category.id,
				title: category.title,
				slug: category.slug,
				description: category.description,
				visible: category.visible,
				children: category.children,
				modules: category.modules
			}))
		);

		isReady = true;
	});
</script>

<div class="cat-admin">
	{#if !isReady}
		<p>Loading...</p>
	{:else}
		<DataGrid {fields} {data} {buttons} />
	{/if}
</div>

{#if openSubcategories && currCategory}
	<Modal
		title="Subcategories"
		closeOnEsc={false}
		closeOnOutsideClick={false}
		onclose={() => (openSubcategories = false)}
		oncancel={() => (openSubcategories = false)}
	>
		<SubCategoryManager id_category={currCategory?.id} onsave={onsave_subcategories} />
	</Modal>
{/if}

<style>
</style>
