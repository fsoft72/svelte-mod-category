import { category_admin_list } from './actions';
import type { Category } from './types';

export const categoryStoreList: Category[] = $state( [] );
const _categoryStoreMap = $derived.by( () => {
	const res: Record<string, Category> = {};
	categoryStoreList.forEach( item => res[ item.id ] = item );

	return res;
} );

export const categoryStoreGetById = ( id: string ) => _categoryStoreMap[ id ];

export const categoriesLoad = async ( force = false ) => {
	if ( !force && Object.keys( categoryStoreList ).length ) return;

	categoryStoreList.length = 0;

	const res = await category_admin_list();
	if ( res.error ) return;

	categoryStoreList.push( ...res );
};