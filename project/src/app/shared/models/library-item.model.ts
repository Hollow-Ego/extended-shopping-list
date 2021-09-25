import { SingleCurrencyData } from './currency-data.model';
import { Image } from './image.model';

export interface LibraryItem {
	itemId: string;
	name: string;
	imgData?: Image;
	tags?: string[];
	amount?: number;
	unit?: string;
	price?: number;
	currency?: SingleCurrencyData;
}
