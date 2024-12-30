<script lang="ts">
	import DataGrid, {
		type DataGridAction,
		type DataGridButton,
		type DataGridField,
		type DataGridRow
	} from '$liwe3/components/DataGrid.svelte';
	import { Plus, Trash } from 'svelte-hero-icons';
	import { storeCategory } from '../store.svelte';
	import type { CategoryTreeItem } from '../types';
	import Modal from '$liwe3/components/Modal.svelte';
	import CategoryAdmin from './CategoryAdmin.svelte';
	import { runeDebug } from '$liwe3/utils/runes.svelte';

	interface Props {
		id_category?: string;
	}

	let { id_category }: Props = $props();

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
				runeDebug('=== ROW: ', row);
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
				const it = storeCategory.create(
					id_category ? 'New Subcategory' : 'New Category',
					id_category
				);
				storeCategory.add(it);
			}
		}
	];

	const actions: DataGridAction[] = [
		{
			label: 'Delete',
			icon: Trash,
			mode: 'danger',
			onclick: async (row: DataGridRow) => {
				await storeCategory.del(row as CategoryTreeItem);
				data = storeCategory.getByParent(id_category);
				console.log('=== DATA: ', data.length);
			}
		}
	];

	let data: DataGridRow[] = $state(storeCategory.getByParent(id_category));
	let currCategory: string = $state('');
	let openSubcategories = $state(false);

	$effect(() => {
		console.log('=== NEW DATA: ', data);
	});

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
	<DataGrid {fields} {data} {buttons} {actions} {oncelledit} />
</div>

{#if openSubcategories && currCategory}
	<Modal
		title="Subcategories"
		closeOnEsc={false}
		closeOnOutsideClick={false}
		onclose={() => (openSubcategories = false)}
		oncancel={() => (openSubcategories = false)}
	>
		<CategoryAdmin id_category={currCategory} />
	</Modal>
{/if}

<style>
</style>
