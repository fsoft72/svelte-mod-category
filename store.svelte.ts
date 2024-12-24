/* eslint-disable @typescript-eslint/no-explicit-any */
import { runeDebug } from '$liwe3/utils/runes.svelte';
import { category_admin_add, category_admin_del, category_admin_list, category_admin_update, category_list } from './actions';
import type { CategoryTreeItem } from './types';

interface CategoryStore {
	categories: CategoryTreeItem[];
	categoriesMap: Record<string, CategoryTreeItem>;

	get ( id: string ): CategoryTreeItem | undefined;
	load ( force?: boolean ): Promise<any>;
	adminLoad ( force?: boolean ): Promise<any>;
	add ( item: CategoryTreeItem, skip_save?: boolean ): Promise<void>;
	del ( item: CategoryTreeItem, skip_save?: boolean ): Promise<void>;
	update ( item: CategoryTreeItem ): Promise<void>;
	fieldUpdate ( id_item: string, field: string, value: any ): Promise<void>;

	list (): { label: string, value: string; }[];
	all (): CategoryTreeItem[];
	getByParent ( id_parent?: string ): CategoryTreeItem[];
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

	async adminLoad ( force = false ) {
		if ( !force && storeCategory.categories.length ) return {};

		storeCategory.categories.length = 0;
		storeCategory.categoriesMap = {};

		const res = await category_admin_list();
		if ( res.error ) return res;

		res.map( ( cat: CategoryTreeItem ) => {
			if ( !cat.id_parent ) {
				storeCategory.categories.push( cat );
			}

			storeCategory.categoriesMap[ cat.id ] = cat;
		} );

		res.map( ( cat: CategoryTreeItem ) => {
			if ( !cat.id_parent ) return;

			const parent = storeCategory.categoriesMap[ cat.id_parent ];
			if ( !parent ) return;

			if ( !parent.children ) parent.children = [];
			parent.is_folder = true;

			parent.children.push( cat );
		} );

		return {};
	},

	async add ( item: CategoryTreeItem, skip_save = false ) {
		if ( !skip_save ) {
			const res = await category_admin_add( item.title, item.slug, item.id_parent, item.description, item.modules, item.top, item.visible, item.image );
			if ( res.error ) return;
		}

		if ( !item.id_parent ) {
			storeCategory.categories.push( item );

			// Sort categories by title
			storeCategory.categories.sort( ( a, b ) => a.title.localeCompare( b.title ) );
		}
		storeCategory.categoriesMap[ item.id ] = item;
	},

	async update ( item: CategoryTreeItem ) {
		const res = await category_admin_update( item.id, item.id_parent, item.title, item.slug, item.description, item.modules, item.top, item.visible, item.image );
		if ( res.error ) return;

		/*
		if ( item.id_parent ) {
			storeCategory._sort_parent( item as any, true );
		}
			*/

		// storeCategory.del( item as any, true );
		// storeCategory.add( item as any, true );
	},

	async fieldUpdate ( id_item: string, field: string, value: any ) {
		const item: Record<string, any> = storeCategory.categoriesMap[ id_item ];
		if ( !item ) return;

		item[ field ] = value;
		await storeCategory.update( item as any );
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
	},

	getByParent ( id_parent?: string ): CategoryTreeItem[] {
		let items: CategoryTreeItem[] = [];

		console.log( "=== getByParent: ", id_parent );
		if ( !id_parent )
			items = storeCategory.categories.filter( ( cat ) => !cat.id_parent );
		else {
			const parent = storeCategory.categoriesMap[ id_parent ];

			if ( !parent || !parent.children ) return [];

			items = parent.children;
		}

		// return items sorted by title without the category with '__empty__' slug
		return items.filter(
			( cat ) => cat.slug !== '__empty__'
		).sort( ( a, b ) => a.title.localeCompare( b.title ) );

	},
} );
