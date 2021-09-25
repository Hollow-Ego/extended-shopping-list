import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { forkJoin, from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Storage } from '@ionic/storage';

import * as SLActions from './shopping-list.actions';
import * as Constants from '../shared/constants';
import { ItemLibrary } from '../shared/classes/item-library.class';
import * as fromApp from '../store/app.reducer';
import {
	selectItemGroups,
	selectItemLibrary as selectItemLibrary,
	selectListsAndLib,
	selectShoppingLists,
} from './shopping-list.selectors';
import { ShoppingListService } from '../services/shopping-list.service';
import { ItemGroup } from '../shared/classes/item-group.class';
import { ShoppingList } from '../shared/classes/shopping-list.class';

import { LibraryItem } from '../shared/models/library-item.model';
import { PopulatedItem } from '../shared/models/populated-item.model';
import { SettingsData } from '../shared/models/settings.model';
import { TranslationService } from '../shared/i18n/translation.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ShoppingListEffects {
	constructor(
		private actions$: Actions<SLActions.ActionsUnion>,
		private storage: Storage,
		private store$: Store<fromApp.AppState>,
		private SLService: ShoppingListService,
		private translate: TranslationService
	) {}

	startInitialLoad$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startInitialLoad),
			mergeMap(() => {
				return forkJoin({
					storageReady: from(this.storage.ready()),
					loadedItemLibrary: from(this.storage.get(Constants.LIBRARY_KEY)),
					loadedItemGroup: from(this.storage.get(Constants.ITEM_GROUP_KEY)),
					loadedShoppingList: from(
						this.storage.get(Constants.SHOPPING_LIST_KEY)
					),
					loadedSettings: from(this.storage.get(Constants.SETTINGS_KEY)),
					loadedStateData: from(this.storage.get(Constants.STATE_KEY)),
				}).pipe(
					map(
						({
							loadedItemLibrary,
							loadedItemGroup,
							loadedShoppingList,
							loadedSettings,
							loadedStateData,
						}) => {
							const itemLibrary = new ItemLibrary(
								new Map<string, LibraryItem>()
							);
							const itemGroups = new Map<string, ItemGroup>();
							const shoppingLists = new Map<string, ShoppingList>();

							if (loadedItemLibrary) {
								itemLibrary.setItems(loadedItemLibrary.items);
								itemLibrary.setSortDetails(
									loadedItemLibrary.sortMode,
									loadedItemLibrary.sortDirection
								);
							}

							if (loadedItemGroup) {
								loadedItemGroup.forEach(rawGroup => {
									const group = new ItemGroup(
										rawGroup.name,
										rawGroup.groupMembers,
										rawGroup.id
									);
									itemGroups.set(group.getId(), group);
								});
							}

							if (loadedShoppingList) {
								loadedShoppingList.forEach(rawList => {
									const list = new ShoppingList(
										rawList.shoppingItems,
										rawList.name,
										rawList.id,
										rawList.mode,
										rawList.sortMode,
										rawList.sortDirection
									);
									shoppingLists.set(list.getListID(), list);
								});
							}
							let latestListId = shoppingLists.keys().next().value;
							if (loadedStateData) {
								if (
									loadedStateData.currentListId &&
									shoppingLists.has(loadedStateData.currentListId)
								) {
									latestListId = loadedStateData.currentListId;
								}
							}

							const settings: SettingsData = loadedSettings
								? loadedSettings
								: {};

							document.body.setAttribute('color-theme', settings.theme);
							this.translate.changeLanguage(settings.language);

							return SLActions.endInitialLoad({
								mode: Constants.EDIT_MODE,
								itemLibrary,
								itemGroups,
								shoppingLists,
								settings,
								currentListId: latestListId,
							});
						}
					)
				);
			})
		)
	);

	startUpdateSettings$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startUpdateSettings),
			mergeMap(props => {
				document.body.setAttribute('color-theme', props.theme);
				this.translate.changeLanguage(props.language);
				const { type, ...newSettings } = props;
				this.storage.set(Constants.SETTINGS_KEY, newSettings);

				return of(SLActions.endUpdateSettings(newSettings));
			}),
			catchError((err: Error) => {
				return of(SLActions.raiseGeneralError({ errors: [err.message] }));
			})
		)
	);
}
