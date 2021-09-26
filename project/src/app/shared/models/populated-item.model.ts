import { SingleCurrencyData } from './currency-data.model';
import { Image } from './image.model';

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
