import { SingleCurrencyData } from './currency-data.interface';
import { Image } from './image.interface';
import { LibraryItem } from './library-item.interface';
import { NameIdObject } from './name-id-object.interface';
import { PopulatedItem } from './populated-item.interface';

export interface AddEditModalOutput {
	id: string;
	libraryId?: string | null;
	name: string;
	amount: number;
	imgData: Image;
	tags: NameIdObject[];
	unit: string;
	price: number;
	currency: SingleCurrencyData;
}

export interface AddEditModalInput {
	availableTags: string[];
	mode: string;
	item: PopulatedItem | LibraryItem;
}
