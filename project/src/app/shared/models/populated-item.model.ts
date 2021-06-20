import { singleCurrencyData } from './currency-data.model';
import { Image } from './image.model';

export interface PopulatedItem {
	itemID: string;
	name: string;
	imgData?: Image;
	unit?: string;
	amount?: number;
	price?: number;
	currency?: singleCurrencyData;
	tags?: string[];
}