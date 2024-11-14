<script lang="ts">
	import { onMount } from 'svelte';
	import { tree_convert_list, type Tree, type TreeItem } from '$liwe3/utils/tree';
	import { category_slug_valid } from '../actions';
	import type { Category } from '../types';
	import { user_init } from '$modules/user/actions';
	import type { FormField } from '$liwe3/components/FormCreator.svelte';
	import FormCreator from '$liwe3/components/FormCreator.svelte';
	import { storeCategory } from '../store.svelte';
	import DraggableTree from '$liwe3/components/DraggableTree.svelte';
	import Modal from '$liwe3/components/Modal.svelte';
	import { mkid } from '$liwe3/utils/utils';
	import Spinner from '$liwe3/components/Spinner.svelte';

	const fields: FormField[] = [
		{
			name: 'id',
			type: 'hidden'
		},
		{
			name: 'id_parent',
			type: 'hidden'
		},
		{
			name: 'title',
			label: 'Title',
			type: 'text',
			required: true
		},
		{
			name: 'slug',
			label: 'Slug',
			type: 'text',
			required: true,
			onchange: async (name: string, slug: string, values: Record<string, any>) => {
				const res = await category_slug_valid(slug, values.id);
				console.log('=== SLUG: ', name, values);
				return true;
			}
		},
		{
			name: 'description',
			label: 'Description',
			type: 'text'
		},
		{
			name: 'top',
			label: 'Top',
			type: 'checkbox'
		},
		{
			name: 'visible',
			label: 'Visible',
			type: 'checkbox'
		},
		{
			name: 'image',
			label: 'Image',
			type: 'mm_image'
		}
	];

	let tree: Tree = $state({ children: [] });
	let showEditItemModal = $state(false);
	let currCateg: Category | null = $state(null);
	let currItem: TreeItem | null = $state(null);

	const _load_categories = async () => {
		await storeCategory.load();

		tree = tree_convert_list(storeCategory.categories);
	};

	const onedititem = (item: TreeItem) => {
		currCateg = item.info;
		currItem = item;
		showEditItemModal = true;
	};

	const oncreatenewitem = async (parent: TreeItem | undefined): Promise<TreeItem | undefined> => {
		const parentId = parent?.id || '';
		const label = parentId ? 'New Subcategory' : 'New Category';
		const idPrefix = parentId ? 'scat' : 'cat';
		let parentNode: Category | null = parent?.info || null;

		const categ: Category = {
			id: mkid(idPrefix),
			id_parent: parentNode?.id || '',
			title: label,
			slug: '',
			description: '',
			top: false,
			visible: true,
			image: ''
		};

		const newItem: TreeItem = {
			id: new Date().getTime().toString(),
			id_parent: parentId,
			name: categ.title!,
			children: [],
			info: categ
		};

		storeCategory.add(categ);

		return newItem;
	};

	const ondelitem = (item: TreeItem) => {
		storeCategory.del(item.info.id);
	};

	const onsubmit = async (values: Record<string, any>) => {
		if (!currItem) return;
		if(!currItem.info) currItem.info = {} as Category;
		Object.assign(currItem.info, values);
		currItem.name = values.title;

		showEditItemModal = false;
	};

	let isReady = $state(false);

	onMount(async () => {
		await user_init();
		await _load_categories();
		isReady = true;
	});
</script>

<div class="container">
	{#if isReady}
		<DraggableTree {tree} maxDepth={1} {onedititem} {oncreatenewitem} {ondelitem} />
	{:else}
		<Spinner />
	{/if}
</div>

{#if showEditItemModal}
	<Modal
		title="Edit Category"
		onclose={() => (showEditItemModal = false)}
		oncancel={() => (showEditItemModal = false)}
	>
		<FormCreator {fields} values={{ ...currCateg }} {onsubmit} />
	</Modal>
{/if}

<style>
	.container {
		max-width: 400px;
		min-height: 300px;

		border: 1px solid var(--liwe-border-color);
		background-color: var(--liwe-paper-color);

		padding: 1em;
	}
</style>
