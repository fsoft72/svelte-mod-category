import { tree_convert_list, type Tree } from '$liwe3/utils/tree';
import { category_admin_list } from './actions';
import type { Category } from './types';

interface CategoryStore {
	categories: Category[];
	categoriesMap: Record<string, Category>;

	get ( id: string ): Category | undefined;
	load ( force?: boolean ): Promise<void>;
	add ( item: Category ): void;
	del ( item: Category ): void;

	tree (): Tree;
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

		res.map( ( cat: Category ) => storeCategory.add( cat ) );
	},

	add ( item: Category ) {
		storeCategory.categories.push( item );
		storeCategory.categoriesMap[ item.id ] = item;
	},

	del ( item: Category ) {
		storeCategory.categories.splice( storeCategory.categories.indexOf( item ), 1 );
		delete storeCategory.categoriesMap[ item.id ];
	},

	tree () {
		return tree_convert_list( storeCategory.categories );
	}
} );
