import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { ItemLibraryRoutingModule } from './item-library-routing.module';
import { ItemLibraryComponent } from './item-library.view';
import { LibraryListItemComponent } from './library-list-item/library-list-item.component';

@NgModule({
	declarations: [ItemLibraryComponent, LibraryListItemComponent],
	imports: [SharedModule, ItemLibraryRoutingModule],
})
export class ItemLibraryModule {}
