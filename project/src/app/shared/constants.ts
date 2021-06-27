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

export const ACTION_EDIT = '[PXSL1] ACTION_EDIT';
export const ACTION_RENAME = '[PXSL1] ACTION_RENAME';
export const ACTION_DELETE = '[PXSL1] ACTION_DELETE';

export const SORT_BY_NAME = '[PXSL1] SORT_BY_NAME';
export const SORT_BY_TAG = '[PXSL1] SORT_BY_TAG';
export const SORT_ASCENDING = '[PXSL1] SORT_ASCENDING';
export const SORT_DESCENDING = '[PXSL1] SORT_DESCENDING';
