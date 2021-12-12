import { SingleCurrencyData } from './currency-data.interface';
import { Image } from './image.interface';

export interface PopulatedItem {
	itemId: string;
	name: string;
	tags: string[];
	imgData?: Image;
	unit?: string;
	amount?: number;
	price?: number;
	currency?: SingleCurrencyData;
}
