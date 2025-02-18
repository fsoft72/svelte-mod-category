import type { TreeItem } from '$liwe3/utils/tree';
import { category_admin_add, category_admin_del, category_admin_list, category_admin_update, category_list } from './actions';

// categoryStore.svelte.ts
interface CategoryTreeItem {
	id: string;
	id_parent: string;
	id_owner: string;
	is_folder: boolean;
	top: boolean;
	title: string;
	description: string;
	image: string;
	children: CategoryTreeItem[];
	slug: string;
	visible: boolean;
	modules?: string[];
}

const sortByTitle = (items: CategoryTreeItem[]): CategoryTreeItem[] =>
	[...items].sort((a, b) => a.title.localeCompare(b.title));

let items: CategoryTreeItem[] = $state([]);
const sortedItems = $derived.by(() => sortByTitle(items));

const _add_categs = (res: CategoryTreeItem[]) => {
	// first add top-level categories
	res.forEach((cat: CategoryTreeItem) => {
		if (!cat.id_parent) store.add(cat, true);
	});

	// then add children
	res.forEach((cat: CategoryTreeItem) => {
		if (!cat.id_parent) return;

		store.add(cat, true);
	});
}

const store = {
	create(title: string, id_parent?: string, slug?: string, description?: string, modules?: string[], top?: boolean, visible?: boolean, image?: string) {
		const item: CategoryTreeItem = {
			id: '',
			id_parent: id_parent ?? '',
			id_owner: '',
			is_folder: false,
			top: top ?? false,
			title,
			description: description ?? '',
			image: image ?? '',
			children: [],
			slug: slug ? slug : new Date().getTime().toString(32),
			visible: visible ?? true,
			modules: modules ?? [],
		};

		return item;
	},

	/**
	 * Adds a new category to the category tree.
	 *
	 * @param {CategoryTreeItem} category - The category to be added.
	 * If the category does not have a parent (`id_parent` is falsy), it is added to the root level.
	 * Otherwise, it traverses the category tree to find the parent category and adds the new category as a child.
	 */
	async add(category: CategoryTreeItem, skip_save = false) {
		if (!skip_save) {
			const res = await category_admin_add(category.title, category.slug, category.id_parent, category.description, category.modules, category.top, category.visible, category.image);
			if (res.error) return;

			category = res;
		}

		if (!category.children) category.children = [];

		if (!category.id_parent) {
			items = [...items, category];
			return;
		}

		const traverse = (cats: CategoryTreeItem[]): boolean =>
			cats.some((item, i) => {
				if (!item.children) item.children = [];

				if (item.id === category.id_parent) {
					cats[i].children = [...item.children, category];
					return true;
				}

				traverse(item.children);
			}
			);

		traverse(items);
	},

	/**
	 * Deletes a category item from the category tree by its ID.
	 *
	 * @param id - The ID of the category item to delete.
	 */
	async del(id: string, skip_save: boolean = false) {
		if (!skip_save) await category_admin_del(id);

		const filter = (cats: CategoryTreeItem[]): CategoryTreeItem[] => {
			return cats.reduce((acc, item) => {
				if (item.id !== id) {
					if (!item.children) item.children = [];
					item.children = filter(item.children);
					acc.push(item);
				}
				return acc;
			}, [] as CategoryTreeItem[]);
		};

		items = filter(items);
	},

	/**
	 * Updates a category tree item with the given updates.
	 *
	 * @param id - The ID of the category tree item to update.
	 * @param updates - An object containing the properties to update in the category tree item.
	 * @returns void
	 */
	async update(id: string, updates: Partial<CategoryTreeItem>) {
		let _item: CategoryTreeItem | null = this.get(id);
		if (!_item) return;

		_item = { ..._item, ...updates };

		await category_admin_update(id, _item.id_parent, _item.title, _item.slug, _item.description, _item.modules, _item.top, _item.visible, _item.image);

		const traverse = (cats: CategoryTreeItem[]): boolean =>
			cats.some((item, i) => {
				if (item.id === id) {
					if (!item.children) item.children = [];

					cats[i] = { ...item, ...updates };
					return true;
				}

				traverse(item.children);
			});

		traverse(items);
	},

	/**
	 * Finds a category tree item by its ID.
	 *
	 * @param id - The ID of the category tree item to find.
	 * @returns The category tree item with the specified ID, or null if not found.
	 */
	get(id: string): CategoryTreeItem | null {
		const traverse = (cats: CategoryTreeItem[]): CategoryTreeItem | null => {
			for (const item of cats) {
				if (item.id === id) return item;
				const found = traverse(item.children);
				if (found) return found;
			}
			return null;
		};
		return traverse(items);
	},

	/**
	 * Retrieves the children of a given parent category, sorted by title.
	 *
	 * @param parentId - The ID of the parent category.
	 * @returns An array of child categories sorted by title. If the parent category is not found, returns an empty array.
	 */
	getByParent(parentId?: string) {
		// if no parent ID is provided, return the top-level categories
		if (!parentId) return sortByTitle(items.filter(c => !c.id_parent));

		const parent = this.get(parentId);
		return sortByTitle(parent?.children ?? []);
	},

	get all() { return sortedItems; },
	get top() { return sortedItems.filter(c => c.top); },

	async adminLoad(force = false) {
		if (!force && items.length) return {};

		// items = [];

		const res = await category_admin_list();
		if (res.error) return res;

		_add_categs(res);

		return sortedItems;
	},

	async load(force: boolean = false) {
		if (!force && items.length) return {};

		const res = await category_list();
		if (res.error) return res;

		_add_categs(res);

		return sortedItems;
	},

	// Returns categories as label / value pairs for use in a select dropdown
	// for sub categories, it adds some padding to the label to show hierarchy
	list() {
		const list = [] as { label: string, value: string; }[];

		const traverse = (cats: CategoryTreeItem[], padding = '') => {
			cats.map(cat => {
				list.push({ label: padding + cat.title, value: cat.id });
				if (cat.children) traverse(cat.children, padding + '— ');
			});
		};

		traverse(items.filter(c => !c.id_parent));

		return list;
	},

	// returns a tree structure as in TreeItem
	tree() {
		const traverse = (cats: CategoryTreeItem[]): TreeItem[] =>
			cats.map(cat => {
				const item: TreeItem = {
					id: cat.id,
					name: cat.title,
					children: cat.children ? traverse(cat.children) : [],
				};

				return item;
			});

		return { children: traverse(items.filter(c => !c.id_parent)) };
	}

};

export default store;