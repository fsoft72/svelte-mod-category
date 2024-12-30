/* eslint-disable @typescript-eslint/no-explicit-any */
import { mkid } from '$liwe3/utils/utils';
import { category_admin_add, category_admin_del, category_admin_list, category_admin_update } from './actions';
import type { CategoryTreeItem } from './types';

interface CategoryStore {
	categories: CategoryTreeItem[];

	create ( title: string, id_parent?: string, slug?: string, description?: string, modules?: string[], top?: boolean, visible?: boolean, image?: string ): CategoryTreeItem;
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

	create ( title: string, id_parent?: string, slug?: string, description?: string, modules?: string[], top?: boolean, visible?: boolean, image?: string ): CategoryTreeItem {
		const id = mkid( 'cat' );

		if ( !slug ) slug = new Date().getTime().toString( 32 );

		return {
			id,
			title,
			id_parent: id_parent ?? '',
			slug,
			description: description ?? '',
			modules: modules ?? [],
			top: top ?? false,
			visible: visible ?? true,
			image: image ?? '',
			children: [],
			id_owner: '',
			is_folder: false,
		};
	},

	get ( id: string ): CategoryTreeItem | undefined {
		const res = storeCategory.categories.filter( ( cat ) => cat.id === id );
		if ( res.length ) return res[ 0 ];

		return undefined;
	},

	async load ( force = false ) {
		if ( !force && storeCategory.categories.length ) return {};

		storeCategory.categories.length = 0;

		return {};
	},

	async adminLoad ( force = false ) {
		if ( !force && storeCategory.categories.length ) return {};

		storeCategory.categories.length = 0;

		const res = await category_admin_list();
		if ( res.error ) return res;

		res.map( ( cat: CategoryTreeItem ) => {
			if ( !cat.id_parent ) storeCategory.categories.push( cat );
		} );

		res.map( ( cat: CategoryTreeItem ) => {
			if ( !cat.id_parent ) return;

			const parent = storeCategory.get( cat.id_parent );
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
	},

	async update ( item: CategoryTreeItem ) {
		const res = await category_admin_update( item.id, item.id_parent, item.title, item.slug, item.description, item.modules, item.top, item.visible, item.image );
		if ( res.error ) return;
	},

	async fieldUpdate ( id_item: string, field: string, value: any ) {
		const item: CategoryTreeItem | undefined = storeCategory.get( id_item );
		if ( !item ) return;

		( item as any )[ field ] = value;
		await storeCategory.update( item );
	},

	async del ( item: CategoryTreeItem, skip_save = false ) {
		if ( !skip_save ) category_admin_del( item.id );

		if ( item.id_parent ) {
			const parent = storeCategory.get( item.id_parent );
			if ( !parent ) return;

			parent.children = parent.children.filter( ( cat ) => cat.id !== item.id );
		} else {
			storeCategory.categories = storeCategory.categories.filter( ( cat ) => cat.id !== item.id );
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
			const parent = storeCategory.get( id_parent );

			if ( !parent || !parent.children ) return [];

			items = parent.children;
		}

		// return items sorted by title without the category with '__empty__' slug
		return items.filter(
			( cat ) => cat.slug !== '__empty__'
		).sort( ( a, b ) => a.title.localeCompare( b.title ) );

	},
} );
