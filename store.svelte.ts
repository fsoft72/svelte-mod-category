import { tree_convert_list, type Tree } from '$liwe3/utils/tree';
import { category_admin_add, category_admin_del, category_admin_list, category_admin_update } from './actions';
import type { Category } from './types';

interface CategoryStore {
	categories: Category[];
	categoriesMap: Record<string, Category>;

	get ( id: string ): Category | undefined;
	load ( force?: boolean ): Promise<void>;
	add ( item: Category, skip_save?: boolean ): Promise<void>;
	del ( item: Category, skip_save?: boolean ): Promise<void>;
	update ( item: Category ): Promise<void>;

	tree (): Tree;
	list (): { label: string, value: string; }[];
}

export const storeCategory: CategoryStore = $state( {
	categories: [],
	categoriesMap: {},

	get ( id: string ): Category | undefined {
		return storeCategory.categoriesMap[ id ];
	},

	async load ( force = false ) {
		if ( !force && storeCategory.categories.length ) return;

		storeCategory.categories.length = 0;
		storeCategory.categoriesMap = {};

		const res = await category_admin_list();
		if ( res.error ) return;

		res.map( ( cat: Category ) => storeCategory.add( cat, true ) );
	},

	async add ( item: Category, skip_save = false ) {
		if ( !skip_save ) {
			const res = await category_admin_add( item.title ?? '', item.slug ?? '', item.id_parent, item.description, item.modules, item.top, item.visible, item.image );
			if ( res.error ) return;
		}
		storeCategory.categories.push( item );
		storeCategory.categoriesMap[ item.id ] = item;
	},

	async update ( item: Category ) {
		const res = await category_admin_update( item.id, item.id_parent, item.title, item.slug, item.description, item.modules, item.top, item.visible, item.image );
		if ( res.error ) return;

		storeCategory.del( item, true );
		storeCategory.add( item, true );
	},

	async del ( item: Category, skip_save = false ) {
		if ( !skip_save ) category_admin_del( item.id );
		storeCategory.categories.splice( storeCategory.categories.indexOf( item ), 1 );
		delete storeCategory.categoriesMap[ item.id ];
	},

	tree () {
		return tree_convert_list( storeCategory.categories );
	},

	// Return a label / value list of all categories
	list () {
		return storeCategory.categories.map( ( cat ) => ( {
			label: cat.title ?? '',
			value: cat.id,
		} ) );
	}
} );
