import { singleCurrencyData } from './currency-data.model';
import { Image } from './image.model';

export interface LibraryItem {
	itemID: string;
	name: string;
	imgData?: Image;
	tags?: string[];
	amount?: number;
	unit?: string;
	price?: number;
	currency?: singleCurrencyData;
}