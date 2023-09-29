<script lang="ts">
	import SelectTree from '$liwe3/components/SelectTree.svelte';
	import { tree_convert_list, type TreeItem } from '$liwe3/utils/tree';
	import { onMount } from 'svelte';
	import { category_list } from '../actions';

	export let categories: TreeItem[] = [];
	export let value: string = '';

	onMount(async () => {
		// we use category_list and not admin_list because also the trainers and users
		// can create courses and they need to see the categories
		const res: any = await category_list();
		if (res.error) return;
		categories = tree_convert_list(res);
	});
</script>

<SelectTree tree={categories} {value} on:change />
