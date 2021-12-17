import { SingleCurrencyData } from './currency-data.interface';
import { Image } from './image.interface';
import { NameIdObject } from './name-id-object.interface';

export interface LibraryItem {
	itemId: string;
	name: string;
	tags: NameIdObject[];
	imgData?: Image | null;
	unit?: string | null;
	amount?: number | null;
	price?: number | null;
	currency?: SingleCurrencyData | null;
}
