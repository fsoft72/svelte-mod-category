<script lang="ts">
	import { onMount } from 'svelte';
	import SimpleTree from '$liwe3/components/SimpleTree.svelte';
	import { tree_find_item, type TreeItem } from '$liwe3/utils/tree';
	import {
		category_admin_add,
		category_admin_del,
		category_admin_list,
		category_admin_update,
		category_slug_valid
	} from '../actions';
	import type { Category } from '../types';
	import { user_init } from '$modules/user/actions';
	import Button from '$liwe3/components/Button.svelte';
	import { mkid } from '$liwe3/utils/utils';
	import type { FormField } from '$liwe3/components/FormCreator.svelte';
	import FormCreator from '$liwe3/components/FormCreator.svelte';
	import { addToast } from '$liwe3/stores/ToastStore.svelte';

	let items: TreeItem[] = [];
	let selected: string = '';
	let item: TreeItem;
	let values: Record<string, any> = {};

	let tree: SimpleTree;

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
			onChange: async (name: string, slug: string, values: Record<string, any>) => {
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

	const _load_categs = async () => {
		const categs = await category_admin_list();
		const newItems: TreeItem[] = [];

		categs.forEach((categ: Category) => {
			if (!categ.id) return;

			const item: TreeItem = {
				id: categ.id,
				id_parent: categ.id_parent,
				name: categ.title!,
				info: categ,
				children: []
			};

			item.isOpen = tree_find_item(items, item.id)?.isOpen ?? false;

			if (item.id_parent) {
				const parent = tree_find_item(newItems, item.id_parent);
				if (parent) parent.children?.push(item);
			} else {
				newItems.push(item);
			}
		});

		items = newItems;
	};

	const onSelect = (e: CustomEvent<{ selected: string[] }>) => {
		// remove the ":" at the beginning and at the end
		selected = e.detail.selected[0].slice(1, -1);
	};

	const mk_empty_item = (id_parent = '') => {
		return {
			id: mkid('temp'),
			name: 'New item',
			id_parent,
			info: {
				title: 'New item',
				description: '',
				id_parent,
				slug: 'new-item',
				top: false,
				visible: false
			},
			children: []
		};
	};

	const newRoot = () => {
		item = mk_empty_item();

		items = [...items, item];

		tree.setSelected(item.id);
	};

	const newItem = (id_parent: string) => {
		const parent = tree_find_item(items, id_parent);
		if (!parent) return;

		item = mk_empty_item(id_parent);

		parent.children?.push(item);
		parent.isOpen = true;

		items = [...items];
		tree.setSelected(item.id);
	};

	const onChange = (e: any) => {
		values[e.detail.name] = e.detail.value;
	};

	const deleteItem = async () => {
		await category_admin_del(item.id!);
		await _load_categs();
	};

	const saveItem = async () => {
		const data: Category = values;
		let res;

		if (data.id?.startsWith('temp')) {
			res = await category_admin_add(
				data.title!,
				data.slug!,
				data.id_parent,
				data.description,
				undefined,
				data.top,
				data.visible
			);
		} else {
			res = await category_admin_update(
				data.id!,
				data.id_parent,
				data.title!,
				data.slug!,
				data.description,
				undefined,
				data.top,
				data.visible
			);
		}

		if (res.error) {
			addToast({
				type: 'error',
				message: res.error.message
			});

			return;
		}

		await _load_categs();
	};

	onMount(async () => {
		await user_init();
		await _load_categs();
	});

	$: item = tree_find_item(items, selected)!;

	$: values = {
		id: item?.id,
		id_parent: item?.info?.id_parent,
		title: item?.info?.title,
		description: item?.info?.description,
		slug: item?.info?.slug,
		top: item?.info?.top,
		visible: item?.info?.visible
	};
</script>

<div class="container">
	{#key items}
		<SimpleTree bind:this={tree} multipleSelection={false} {items} on:select={onSelect} />
	{/key}
	<div class="actions">
		<Button on:click={newRoot}>New root</Button>
		{#if item}
			<Button disabled={item.level ?? 0 > 1} on:click={() => newItem(item.id)}>New Sub Item</Button>
		{/if}
	</div>
	{#if item}
		<div class="details">
			<FormCreator {fields} {values} showButtons={false} on:change={onChange} />
			<div class="row">
				<Button mode="danger" on:click={deleteItem}>Delete</Button>
				<Button mode="success" on:click={saveItem}>
					{#if item.id.startsWith('temp')}
						Create
					{:else}
						Update
					{/if}
				</Button>
			</div>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 400px;
		min-height: 300px;

		border: 1px solid var(--liwe-border-color);
		background-color: var(--liwe-paper-color);

		padding: 1em;
	}

	.actions {
		margin-top: 1em;
		border-top: var(--liwe-border-color);
	}

	.details {
		margin-top: 1em;
	}

	.row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
</style>
