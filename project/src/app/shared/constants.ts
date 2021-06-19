export const SHOPPING_MODE = '[PXSL1] SHOPPPING_MODE';
export const EDIT_MODE = '[PXSL1] EDIT_LIST_MODE';

export const LIBRARY_KEY = '[PXSL1] LIBRARY_KEY';
export const ITEM_GROUP_KEY = '[PXSL1] ITEM_GROUP_KEY';
export const SHOPPING_LIST_KEY = '[PXSL1] SHOPPING_LIST_KEY';
export const SETTINGS_KEY = '[PXSL1] SETTINGS_KEY';
export const STATE_KEY = '[PXSL1] STATE_KEY';

export const MODAL_ADD_MODE = '[PXSL1] MODAL_ADD_MODE';
export const MODAL_EDIT_MODE = '[PXSL1] MODAL_EDIT_MODE';

export const DEFAULT_SHOPPING_LIST_NAME = 'uiStrings.unnamedList';

export const DARK_THEME = '[PXSL1] DARK';
export const LIGHT_THEME = '[PXSL1] LIGHT';

export const DEFAULT_SETTINGS = {
	language: 'en',
	theme: window.matchMedia('(prefers-color-scheme: dark)').matches
		? DARK_THEME
		: LIGHT_THEME,
};

export const LIST_ACTION_RENAME = '[PXSL1] RENAME_SHOPPING_LIST';
export const LIST_ACTION_DELETE = '[PXSL1] DELETE_SHOPPING_LIST';
