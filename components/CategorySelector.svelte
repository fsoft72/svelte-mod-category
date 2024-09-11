<script lang="ts">
	import SelectTree from '$liwe3/components/SelectTree.svelte';
	import { type Tree } from '$liwe3/utils/tree';
	import { storeCategory } from '../store.svelte';

	interface Props {
		value?: string;

		onchange: (value: string) => void;
	}

	let { value = '', onchange }: Props = $props();
</script>

<SelectTree tree={storeCategory.tree()} {value} {onchange} />
