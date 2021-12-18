import { v4 as uuidv4 } from 'uuid';

export function createOrCopyID(itemId: string | null): string {
	return itemId && itemId.trim().length > 0 ? itemId : uuidv4();
}
