import { SingleCurrencyData } from './currency-data.interface';
import { Image } from './image.interface';

export interface LibraryItem {
	itemId: string;
	name: string;
	tags: string[];
	imgData?: Image;
	amount?: number;
	unit?: string;
	price?: number;
	currency?: SingleCurrencyData;
}
