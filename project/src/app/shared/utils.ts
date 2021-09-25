import { v4 as uuidv4 } from 'uuid';

export function createOrCopyID(itemId: string): string {
	return itemId ? itemId : uuidv4();
}
