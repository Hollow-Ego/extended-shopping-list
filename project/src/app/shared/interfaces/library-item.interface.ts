import { SingleCurrencyData } from './currency-data.interface';
import { Image } from './image.interface';
import { NameIdObject } from './name-id-object.interface';

export interface LibraryItem {
	itemId: string;
	name: string;
	tags: NameIdObject[];
	imgData?: Image;
	amount?: number;
	unit?: string;
	price?: number;
	currency?: SingleCurrencyData;
}
