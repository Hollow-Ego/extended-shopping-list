import { SingleCurrencyData } from './currency-data.model';
import { Image } from './image.model';
import { LibraryItem } from './library-item.model';
import { PopulatedItem } from './populated-item.model';

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
