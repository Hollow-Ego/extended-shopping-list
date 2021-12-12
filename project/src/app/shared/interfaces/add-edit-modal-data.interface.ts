import { SingleCurrencyData } from './currency-data.interface';
import { Image } from './image.interface';
import { LibraryItem } from './library-item.interface';
import { PopulatedItem } from './populated-item.interface';

export interface AddEditModalOutput {
	itemId: string;
	name: string;
	amount: number;
	imgData: Image;
	tags: string[];
	unit: string;
	price: number;
	currency: SingleCurrencyData;
}

export interface AddEditModalInput {
	availableTags: string[];
	mode: string;
	item: PopulatedItem | LibraryItem;
}