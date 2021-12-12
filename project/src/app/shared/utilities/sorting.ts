import { ShoppingList } from '../classes/shopping-list.class';
import { Sort } from '../enums/sorting.enum';
import { PopulatedItem } from '../interfaces/populated-item.interface';

export function sortItemByName(
	sortDirection: number = Sort.Ascending,
	a: PopulatedItem,
	b: PopulatedItem
) {
	const nameA = a.name.toUpperCase();
	const nameB = b.name.toUpperCase();
	const ascending = sortDirection === Sort.Ascending;
	const priority = String(nameA).localeCompare(nameB);
	return ascending ? priority : priority * -1;
}

export function sortItemByTag(
	sortDirection: number = Sort.Ascending,
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

	const ascending = sortDirection === Sort.Ascending;

	if (tagNameA === tagNameB) {
		return sortItemByName(sortDirection, a, b);
	}
	if (tagNameA < tagNameB) {
		return ascending ? -1 : 1;
	}
	return ascending ? 1 : -1;
}

export function sortListByName(a: ShoppingList, b: ShoppingList) {
	var nameA = a.name.toUpperCase();
	var nameB = b.name.toUpperCase();
	return String(nameA).localeCompare(nameB);
}
