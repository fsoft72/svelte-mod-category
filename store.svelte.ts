/* eslint-disable @typescript-eslint/no-explicit-any */
import { runeDebug } from '$liwe3/utils/runes.svelte';
import { category_admin_add, category_admin_del, category_admin_update, category_list } from './actions';
import type { Category, CategoryTreeItem } from './types';

interface CategoryStore {
	categories: CategoryTreeItem[];
	categoriesMap: Record<string, CategoryTreeItem>;

	get ( id: string ): CategoryTreeItem | undefined;
	load ( force?: boolean ): Promise<any>;
	add ( item: CategoryTreeItem, skip_save?: boolean ): Promise<void>;
	del ( item: Category, skip_save?: boolean ): Promise<void>;
	update ( item: Category ): Promise<void>;

	list (): { label: string, value: string; }[];
	all (): CategoryTreeItem[];

	_sort_parent ( item: CategoryTreeItem, skip_save?: boolean ): void;
}

export const storeCategory: CategoryStore = $state( {
	categories: [],
	categoriesMap: {},

	get ( id: string ): CategoryTreeItem | undefined {
		return storeCategory.categoriesMap[ id ];
	},

	async load ( force = false ) {
		if ( !force && storeCategory.categories.length ) return {};

		storeCategory.categories.length = 0;
		storeCategory.categoriesMap = {};

		const res = await category_list();
		if ( res.error ) return res;

		console.log( "=== RES: ", res );

		res.map( ( cat: CategoryTreeItem ) => {
			storeCategory.categories.push( cat );
			storeCategory.categoriesMap[ cat.id ] = cat;

			if ( cat.children ) {
				cat.children.map( ( child: CategoryTreeItem ) => {
					storeCategory.categoriesMap[ child.id ] = child;
				} );
			}
		} );

		return {};
	},

	_sort_parent ( item: CategoryTreeItem, skip_save = false ) {
		const parent = storeCategory.categoriesMap[ item.id_parent ];
		if ( !parent ) return;

		if ( !parent.children ) parent.children = [];
		if ( !parent.children.includes( item ) ) parent.children.push( item );
		if ( !skip_save ) storeCategory.update( parent as any );

		// Sort children by title
		parent.children.sort( ( a, b ) => a.title.localeCompare( b.title ) );

		// replace category in main list
		const pos = storeCategory.categories.findIndex( ( cat ) => cat.id === parent.id );
		if ( pos != -1 ) storeCategory.categories.splice( pos, 1 );
		storeCategory.categories.splice( pos, 0, parent );

		storeCategory.categoriesMap[ item.id ] = item;
	},

	async add ( item: CategoryTreeItem, skip_save = false ) {
		if ( !skip_save ) {
			const res = await category_admin_add( item.title, item.slug, item.id_parent, item.description, item.modules, item.top, item.visible, item.image );
			if ( res.error ) return;
		}

		if ( item.id_parent ) {
			storeCategory._sort_parent( item, true );
		} else {
			storeCategory.categories.push( item );

			// Sort categories by title
			storeCategory.categories.sort( ( a, b ) => a.title.localeCompare( b.title ) );
		}
		storeCategory.categoriesMap[ item.id ] = item;

		console.log( "=== ADD: ", item );
	},

	async update ( item: CategoryTreeItem ) {
		const res = await category_admin_update( item.id, item.id_parent, item.title, item.slug, item.description, item.modules, item.top, item.visible, item.image );
		if ( res.error ) return;

		if ( item.id_parent ) {
			storeCategory._sort_parent( item as any, true );
		}

		storeCategory.del( item as any, true );
		storeCategory.add( item as any, true );
	},

	async del ( item: CategoryTreeItem, skip_save = false ) {
		if ( !skip_save ) category_admin_del( item.id );
		const pos = storeCategory.categories.findIndex( ( cat ) => cat.id === item.id );
		if ( pos != -1 ) {
			storeCategory.categories.splice( pos, 1 );
			delete storeCategory.categoriesMap[ item.id ];
		}
	},

	// Return a label / value list of all categories
	list () {
		return storeCategory.categories.map( ( cat ) => ( {
			label: cat.title ?? '',
			value: cat.id,
		} ) );
	},

	all () {
		return storeCategory.categories;
	}
} );
