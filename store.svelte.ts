import { category_admin_list } from './actions';
import type { Category } from './types';

export const storeCategory: Category[] = $state( [] );
const _categoryStoreMap = $derived.by( () => {
	const res: Record<string, Category> = {};
	storeCategory.forEach( item => res[ item.id ] = item );

	return res;
} );

export const categoryGetById = ( id: string ): Category | undefined => _categoryStoreMap[ id ];

export const categoriesLoad = async ( force = false ) => {
	if ( !force && Object.keys( storeCategory ).length ) return;

	storeCategory.length = 0;

	const res = await category_admin_list();
	if ( res.error ) return;

	storeCategory.push( ...res );
};

export const categoryAdd = ( item: Category ) => {
	storeCategory.push( item );
};

export const categoryDel = ( categ: Category ) => {
	// since we cannot recreate the storeCategory array,
	// we need to create an array with all the indexes we want to delete
	const idxs: number[] = [];

	storeCategory.map( ( item, idx ) => {
		if ( item.id_parent === categ.id ) {
			idxs.push( idx );
		}
	} );

	// reverse the array so we can delete the items from the end
	idxs.reverse().map( idx => storeCategory.splice( idx, 1 ) );

	// delete the category
	storeCategory.splice( storeCategory.indexOf( categ ), 1 );

};