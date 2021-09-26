import { ShoppingList } from './classes/shopping-list.class';
import { SORT_ASCENDING } from './constants';
import { PopulatedItem } from './models/populated-item.model';

export function sortItemByName(
	sortDirection: string = SORT_ASCENDING,
	a: PopulatedItem,
	b: PopulatedItem
) {
	const nameA = a.name.toUpperCase();
	const nameB = b.name.toUpperCase();
	const ascending = sortDirection === SORT_ASCENDING;
	const priority = String(nameA).localeCompare(nameB);
	return ascending ? priority : priority * -1;
}

export function sortItemByTag(
	sortDirection: string = SORT_ASCENDING,
	a: PopulatedItem,
	b: PopulatedItem
) {
	if (!a.tags) {
		a.tags = [];
	}
	if (!b.tags) {
		b.tags = [];
	}
	const tagNameA = a.tags.length > 0 ? a.tags[0].toUpperCase() : 'ZZZZ';
	const tagNameB = b.tags.length > 0 ? b.tags[0].toUpperCase() : 'ZZZZ';

	const ascending = sortDirection === SORT_ASCENDING;

	if (tagNameA === tagNameB) {
		return sortItemByName(sortDirection, a, b);
	}
	if (tagNameA < tagNameB) {
		return ascending ? -1 : 1;
	}
	return ascending ? 1 : -1;
}

export function sortListByName(a: ShoppingList, b: ShoppingList) {
	var nameA = a.getName().toUpperCase();
	var nameB = b.getName().toUpperCase();
	return String(nameA).localeCompare(nameB);
}
