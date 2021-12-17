import { SingleCurrencyData } from './currency-data.interface';
import { Image } from './image.interface';
import { NameIdObject } from './name-id-object.interface';

export interface PopulatedItem {
	itemId: string;
	name: string;
	tags: NameIdObject[];
	imgData?: Image;
	unit?: string;
	amount?: number;
	price?: number;
	currency?: SingleCurrencyData;
}
