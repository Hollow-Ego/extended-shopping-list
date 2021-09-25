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
								: Constants.DEFAULT_SETTINGS;

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

	startAddLibraryItem$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startAddLibraryItem),
			concatLatestFrom(() => this.store$.select(selectItemLibrary)),
			mergeMap(([props, itemLibrary]) => {
				return from(this.SLService.addLibraryItem(props, itemLibrary)).pipe(
					map(itemLibrary => {
						return SLActions.endAddLibraryItem({ itemLibrary });
					}),
					catchError((err: Error) => {
						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);

	startUpdateLibraryItem$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startUpdateLibraryItem),
			concatLatestFrom(() => this.store$.select(selectItemLibrary)),
			mergeMap(([props, itemLibrary]) => {
				return from(this.SLService.updateLibraryItem(props, itemLibrary)).pipe(
					map(itemLibrary => {
						return SLActions.endUpdateLibraryItem({ itemLibrary });
					}),
					catchError((err: Error) => {
						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);

	startUpdateLibrary$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startUpdateLibrary),
			concatLatestFrom(() => this.store$.select(selectItemLibrary)),
			mergeMap(([props, itemLibrary]) => {
				return from(this.SLService.updateLibrary(props, itemLibrary)).pipe(
					map(itemLibrary => {
						return SLActions.endUpdateLibrary({ itemLibrary });
					}),
					catchError((err: Error) => {
						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);

	startRemoveLibraryItem$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startRemoveLibraryItem),
			concatLatestFrom(() => this.store$.select(selectItemLibrary)),
			mergeMap(([props, itemLibrary]) => {
				return from(
					this.SLService.removeLibraryItem(props.itemID, itemLibrary)
				).pipe(
					map(itemLibrary => {
						return SLActions.endRemoveLibraryItem({ itemLibrary });
					}),
					catchError((err: Error) => {
						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);

	startSyncListItemAndLibItem$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startSyncListItemAndLibItem),
			concatLatestFrom(() => this.store$.select(selectListsAndLib)),
			mergeMap(([props, { shoppingLists, itemLibrary }]) => {
				return from(
					this.SLService.syncListAndLibrary(props, shoppingLists, itemLibrary)
				).pipe(
					map(({ itemLibrary, shoppingLists }) => {
						return SLActions.endSyncListItemAndLibItem({
							itemLibrary,
							shoppingLists,
						});
					}),
					catchError((err: Error) => {
						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);

	startAddListItem$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startAddListItem),
			concatLatestFrom(() => this.store$.select(selectShoppingLists)),
			mergeMap(([props, shoppingLists]) => {
				return from(this.SLService.addListItem(props, shoppingLists)).pipe(
					map(newShoppingLists => {
						return SLActions.endAddListItem({
							shoppingLists: newShoppingLists,
						});
					}),
					catchError((err: Error) => {
						console.log(err);

						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);

	startUpdateListItem$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startUpdateListItem),
			concatLatestFrom(() => this.store$.select(selectShoppingLists)),
			mergeMap(([props, shoppingLists]) => {
				return from(
					this.SLService.updateListItem(props.item, props.listId, shoppingLists)
				).pipe(
					map(shoppingLists => {
						return SLActions.endUpdateListItem({ shoppingLists });
					}),
					catchError((err: Error) => {
						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);

	startRemoveListItem$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startRemoveListItem),
			concatLatestFrom(() => this.store$.select(selectShoppingLists)),
			mergeMap(([props, shoppingLists]) => {
				return from(
					this.SLService.removeListItem(
						props.itemID,
						props.listId,
						shoppingLists
					)
				).pipe(
					map(shoppingLists => {
						return SLActions.endRemoveListItem({ shoppingLists });
					}),
					catchError((err: Error) => {
						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);

	startAddToItemGroup$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startAddToItemGroup),
			concatLatestFrom(() => this.store$.select(selectItemGroups)),
			mergeMap(([props, itemGroups]) => {
				return from(this.SLService.addToItemGroup(props, itemGroups)).pipe(
					map(newItemGroup => {
						return SLActions.endAddToItemGroup({
							itemGroups: newItemGroup,
						});
					}),
					catchError((err: Error) => {
						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);

	startRemoveFromItemGroup$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startRemoveFromItemGroup),
			concatLatestFrom(() => this.store$.select(selectItemGroups)),
			mergeMap(([props, itemGroups]) => {
				return from(this.SLService.removeFromItemGroup(props, itemGroups)).pipe(
					map(itemGroups => {
						return SLActions.endRemoveFromItemGroup({ itemGroups });
					}),
					catchError((err: Error) => {
						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
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

	startAddShoppingList$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startAddShoppingList),
			concatLatestFrom(() => this.store$.select(selectShoppingLists)),
			mergeMap(([props, shoppingLists]) => {
				return from(this.SLService.addShoppingList(props, shoppingLists)).pipe(
					map(data => {
						return SLActions.endAddShoppingList({
							shoppingLists: data.shoppingLists,
							newListId: data.newListId,
						});
					}),
					catchError((err: Error) => {
						console.log(err);

						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);

	startUpdateShoppingList$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startUpdateShoppingList),
			concatLatestFrom(() => this.store$.select(selectShoppingLists)),
			mergeMap(([props, shoppingLists]) => {
				return from(
					this.SLService.updateShoppingList(props, shoppingLists)
				).pipe(
					map(shoppingLists => {
						return SLActions.endUpdateShoppingList({
							shoppingLists,
						});
					}),
					catchError((err: Error) => {
						console.log(err);

						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);

	startRemoveShoppingList$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startRemoveShoppingList),
			concatLatestFrom(() => this.store$.select(selectShoppingLists)),
			mergeMap(([props, shoppingLists]) => {
				return from(
					this.SLService.removeShoppingList(props, shoppingLists)
				).pipe(
					map(data => {
						return SLActions.endRemoveShoppingList({
							shoppingLists: data.shoppingLists,
							newListId: data.newListId,
						});
					}),
					catchError((err: Error) => {
						console.log(err);

						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);

	startToggleListMode$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startToggleListMode),
			concatLatestFrom(() => this.store$.select(selectShoppingLists)),
			mergeMap(([props, shoppingLists]) => {
				return from(this.SLService.toggleListMode(props, shoppingLists)).pipe(
					map(shoppingLists => {
						return SLActions.endToggleListMode({
							shoppingLists,
						});
					}),
					catchError((err: Error) => {
						console.log(err);

						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);

	startSetNewCurrentList$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startSetNewCurrentList),
			mergeMap(props => {
				return from(this.SLService.updateStateDetails(props)).pipe(
					map(stateData => {
						return SLActions.endSetNewCurrentList({
							listId: stateData.currentListId,
						});
					}),
					catchError((err: Error) => {
						console.log(err);

						return of(SLActions.raiseGeneralError({ errors: [err.message] }));
					})
				);
			})
		)
	);
}
