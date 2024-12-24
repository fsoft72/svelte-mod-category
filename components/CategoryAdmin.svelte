<script lang="ts">
	import DataGrid, {
		type DataGridButton,
		type DataGridField,
		type DataGridRow
	} from '$liwe3/components/DataGrid.svelte';
	import { Plus } from 'svelte-hero-icons';
	import { storeCategory } from '../store.svelte';
	import type { CategoryTreeItem } from '../types';
	import Modal from '$liwe3/components/Modal.svelte';
	import CategoryAdmin from './CategoryAdmin.svelte';

	interface Props {
		categories?: CategoryTreeItem[];
	}

	let { categories }: Props = $props();

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
			name: 'top',
			label: 'Top',
			type: 'checkbox',
			align: 'center',
			filterable: true,
			sortable: true,
			editable: true
		},
		{
			name: 'image',
			label: 'Image',
			type: 'text',
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

	const data: DataGridRow[] = $state(categories ? categories : []);
	let currCategory: string = $state('');
	let openSubcategories = $state(false);

	const manageSubcategories = (row: DataGridRow) => {
		currCategory = row.id;
		openSubcategories = true;
	};

	const oncelledit = (row: DataGridRow, field: string, oldValue: any, newValue: any) => {
		if (oldValue === newValue) return;

		storeCategory.fieldUpdate(row.id, field, newValue);
	};
</script>

<div class="cat-admin">
	<DataGrid {fields} {data} {buttons} {oncelledit} />
</div>

{#if openSubcategories && currCategory}
	<Modal
		title="Subcategories"
		closeOnEsc={false}
		closeOnOutsideClick={false}
		onclose={() => (openSubcategories = false)}
		oncancel={() => (openSubcategories = false)}
	>
		<CategoryAdmin categories={storeCategory.getByParent(currCategory)} />
	</Modal>
{/if}

<style>
</style>
