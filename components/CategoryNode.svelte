<script lang="ts">
	import Button from '$liwe3/components/Button.svelte';
	import { challenge_create } from '$liwe3/utils/utils';
	import { storeCategory } from '../store.svelte';
	import type { CategoryTreeItem } from '../types';
	import CategoryNode from './CategoryNode.svelte';

	interface Props {
		categories: CategoryTreeItem[];
		level?: number;
	}

	let { categories, level = 0 }: Props = $props();

	console.log('=== CAT: ', categories);

	const addSubfolder = (category: CategoryTreeItem) => {
		const it: CategoryTreeItem = {
			title: 'New subfolder',
			id_parent: category.id,
			children: [],
			is_folder: false,
			description: '',
			id: new Date().getTime().toString(32),
			slug: 'slug ' + new Date().getTime().toString(32),
			id_owner: '',
			top: false,
			visible: true,
			image: ''
		};

		storeCategory.add(it);
	};
</script>

<div class="category-node" style="margin-left: {level * 20}px">
	{#each categories as category}
		<div class="item">
			<div class="title">
				<span>{category.title}</span>
				{#if level === 0}
					<Button onclick={() => addSubfolder(category)}>Add subfolder</Button>
				{/if}
			</div>
			LEN: {category.children?.length}
			{#key category.children}
				{#if category.children?.length > 0}
					<CategoryNode categories={category.children} level={level + 1} />
				{/if}
			{/key}
		</div>
	{/each}
</div>
