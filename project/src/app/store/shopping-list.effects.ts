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
	selectShoppingLists,
} from './shopping-list.selectors';
import { ShoppingListService } from '../services/shopping-list.service';
import { ItemGroup } from '../shared/classes/item-group.class';
import { ShoppingList } from '../shared/classes/shopping-list.class';

import { LibraryItem } from '../shared/models/library-item.model';
import { PopulatedItem } from '../shared/models/populated-item.model';

@Injectable()
export class ShoppingListEffects {
	constructor(
		private actions$: Actions<SLActions.ActionsUnion>,
		private storage: Storage,
		private store$: Store<fromApp.AppState>,
		private SLService: ShoppingListService
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
				}).pipe(
					map(({ loadedItemLibrary, loadedItemGroup, loadedShoppingList }) => {
						let itemLibrary = new ItemLibrary(new Map<string, LibraryItem>());
						let itemGroups = [];
						let shoppingLists = [
							new ShoppingList(
								new Map<string, PopulatedItem>(),
								Constants.DEFAULT_SHOPPING_LIST_NAME
							),
						];

						if (loadedItemLibrary) {
							itemLibrary.setItems(loadedItemLibrary.items);
						}

						if (loadedItemGroup) {
							loadedItemGroup.forEach(rawGroup => {
								const group = new ItemGroup(
									rawGroup.name,
									rawGroup.groupMembers
								);
								itemGroups.push(group);
							});
						}

						if (loadedShoppingList) {
							shoppingLists = [];
							loadedShoppingList.forEach(rawList => {
								const list = new ShoppingList(
									rawList.shoppingItems,
									rawList.name
								);
								shoppingLists.push(list);
							});
						}

						return SLActions.endInitialLoad({
							mode: Constants.EDIT_MODE,
							itemLibrary,
							itemGroups,
							shoppingLists,
						});
					})
				);
			})
		)
	);

	startAddLibraryItem$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startAddLibraryItem),
			concatLatestFrom(() => this.store$.select(selectItemLibrary)),
			mergeMap(([props, itemLibrary]) => {
				return this.SLService.addLibraryItem(props, itemLibrary).pipe(
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
				return this.SLService.updateLibraryItem(props, itemLibrary).pipe(
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

	startRemoveLibraryItem$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startRemoveLibraryItem),
			concatLatestFrom(() => this.store$.select(selectItemLibrary)),
			mergeMap(([props, itemLibrary]) => {
				return this.SLService.removeLibraryItem(props.itemID, itemLibrary).pipe(
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

	startAddListItem$ = createEffect(() =>
		this.actions$.pipe(
			ofType(SLActions.startAddListItem),
			concatLatestFrom(() => this.store$.select(selectShoppingLists)),
			mergeMap(([props, shoppingLists]) => {
				return this.SLService.addListItem(props, shoppingLists).pipe(
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
				return this.SLService.updateListItem(
					props.item,
					props.listIdx,
					shoppingLists
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
				return this.SLService.removeListItem(
					props.itemID,
					props.listIdx,
					shoppingLists
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
				return this.SLService.addToItemGroup(props, itemGroups).pipe(
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
				return this.SLService.removeFromItemGroup(props, itemGroups).pipe(
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
}
