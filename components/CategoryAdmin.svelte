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
	import { runeDebug } from '$liwe3/utils/runes.svelte';

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
		currCategory = storeCategory.categories.find((category) => category.id == row.id)!;
		openSubcategories = true;
	};

	const onsave_subcategories = (subcategories: CategoryTreeItem[]) => {
		// compare subcategories with currCategory.children
		// create a list of subcategories to add (elements in subcategories but not in currCategory.children)
		// create a list of subcategories to remove (elements in currCategory.children but not in subcategories)
		// create a list of subcategories to update (elements in both subcategories and currCategory.children with different values)

		const toAdd = subcategories.filter(
			(subcategory) => !currCategory?.children.find((child) => child.id == subcategory.id)
		);
		const toRemove = currCategory?.children.filter(
			(child) => !subcategories.find((subcategory) => subcategory.id == child.id)
		);
		const toUpdate = subcategories.filter((subcategory) => {
			const currSubcategory = currCategory?.children.find((child) => child.id == subcategory.id);

			runeDebug('=== UPDATE: ', { currSubcategory, subcategory });

			return currSubcategory && JSON.stringify(currSubcategory) !== JSON.stringify(subcategory);
		});

		console.log('=== TO ADD: ', toAdd);
		console.log('=== TO REMOVE: ', toRemove);
		console.log('=== TO UPDATE: ', toUpdate);

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
