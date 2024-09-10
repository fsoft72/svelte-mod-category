<script lang="ts">
	import SelectTree from '$liwe3/components/SelectTree.svelte';
	import { type Tree, type TreeItem } from '$liwe3/utils/tree';

	interface Props {
		value?: string;
		categories?: TreeItem[];

		onchange: (value: string) => void;
	}

	let { value = '', categories = [], onchange }: Props = $props();
</script>

<SelectTree tree={categories} {value} {onchange} />
