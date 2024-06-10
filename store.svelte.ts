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