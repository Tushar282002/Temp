.ts file 
import { Component, computed, inject, Input, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SearchAutoCompleteComponent } from '../abstractions/search-autocomplete.component';
import { createControlValueAccessorProviders } from '../abstractions/control-value-accessor-base';
import { RestApiConstant } from '../../constants/rest-api.constants';
import { searchEmployeesForVisibilityRequestModel } from '../../core/models/request/search-employees-for-visibility-request.model';

// Define your response interface based on your API
export interface ISearchEmployeeResponse {
  employeeId?: string;
  employeeName?: string;
  email?: string;
  department?: string;
  displayValue?: string;
}

@Component({
  selector: 'app-search-employees',
  imports: [
    CommonModule,
    MatAutocompleteModule, 
    MatInputModule, 
    FormsModule, 
    MatChipsModule, 
    MatTooltipModule,
    MatCheckboxModule
  ],
  templateUrl: './search-employees.component.html',
  styleUrl: './search-employees.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: createControlValueAccessorProviders(SearchEmployeesComponent)
})
export class SearchEmployeesComponent extends SearchAutoCompleteComponent<ISearchEmployeeResponse> {
  @ViewChild(MatAutocompleteTrigger, { static: false })
  private readonly autocompleteTrigger!: MatAutocompleteTrigger;

  private readonly httpClient = inject(HttpClient);

  @Input() allowedEmployeeCount = 0; // 0 means unlimited

  override inputPlaceholder = 'Search by employee name';
  override displayMemberPath = '(employeeName)';

  readonly hideChip = computed(() => {
    if (this.isDisabled()) {
      return true;
    } else {
      return this.selectedItems().length <= 0;
    }
  });

  readonly hideInput = computed(() => {
    if (this.isDisabled()) {
      return true;
    } else {
      const count = this.allowedEmployeeCount ?? 0;
      return count > 0 && this.selectedItems().length >= count;
    }
  });

  override ngOnInit(): void {
    super.ngOnInit();
    this.searchItemsCallback = this.searchEmployees;
    this.isSearchInProgress = false;
  }

  searchEmployees = (searchQuery: string): Observable<ISearchEmployeeResponse[]> => {
    let searchRequest: searchEmployeesForVisibilityRequestModel = {
      searchText: searchQuery
    };

    return this.httpClient.post<ISearchEmployeeResponse[]>(RestApiConstant.searchEmployees, searchRequest)
      .pipe(map((raw) => {
        return raw?.map(item => ({
          ...item,
          displayValue: item.displayValue || `${item.employeeName} (${item.email})`
        }));
      }));
  };

  override onInputChange(event: Event): void {
    super.onInputChange(event);
  }

  searchOnClick(): void {
    this.autocompleteTrigger.openPanel();
    if (!this.isSearchInProgress && this.searchQuery && this.searchQuery().length >= 3) {
      this.updateOptions(this.searchQuery(), () => {});
    }
  }

  onKeyup(event: KeyboardEvent): void {
    const key = event.key;
    if (key === 'Escape') {
      this.closeAutocomplete();
      return;
    }
    if (key === 'Enter' && event.ctrlKey) {
      this.searchOnClick();
    }
  }

  private closeAutocomplete(): void {
    this.autocompleteTrigger?.closePanel?.();
  }

  isOptionSelected(option: ISearchEmployeeResponse): boolean {
    return this.selectedItems().some(
      item => this.getEmployeeId(item) === this.getEmployeeId(option)
    );
  }

  onCheckboxChange(option: ISearchEmployeeResponse, isChecked: boolean): void {
    const currentItems = this.selectedItems();
    const optionId = this.getEmployeeId(option);
    
    if (isChecked) {
      const limit = this.allowedEmployeeCount;
      if (limit > 0 && currentItems.length >= limit) {
        return;
      }

      const exists = currentItems.some(item => this.getEmployeeId(item) === optionId);
      if (!exists) {
        const updatedItems = [...currentItems, option];
        this.selectedItems.set(updatedItems);
      }
    } else {
      const updatedItems = currentItems.filter(item => this.getEmployeeId(item) !== optionId);
      this.selectedItems.set(updatedItems);
    }
  }

  removeSelectedItem(item: ISearchEmployeeResponse): void {
    const updatedItems = this.selectedItems().filter(
      selected => this.getEmployeeId(selected) !== this.getEmployeeId(item)
    );
    this.selectedItems.set(updatedItems);
  }

  private getEmployeeId(employee: ISearchEmployeeResponse): string {
    return employee.employeeId || employee.email || JSON.stringify(employee);
  }
          }


. html 
<label *ngIf="label != null && label.length > 0" for="searchInput" [class]="{'required': isRequired}">
  {{ label }}
</label>

<mat-chip-grid #clientChipGrid [hidden]="hideChip()">
  @for (item of selectedItemsInternal(); track item.objectAsString) {
    <mat-chip-row 
      class="chip-style" 
      (removed)="removeSelectedItem(item)" 
      matTooltipClass="tooltip"
      [matTooltip]="item.displayValue">
      <span class="chip-data-style">{{ item.displayValue }}</span>
      <button matChipRemove>
        <i class="icon icon-close"></i>
      </button>
    </mat-chip-row>
  }
  <input [hidden]="true" [matChipInputFor]="clientChipGrid" />
</mat-chip-grid>

<div>
  <div *ngIf="isDisabled()">
    @for (item of selectedItemsInternal(); track item.objectAsString) {
      <input 
        matTooltipClass="tooltip" 
        [matTooltip]="item.displayValue" 
        class="form-control" 
        readonly
        [value]="item.displayValue">
    }
  </div>

  <div [class]="isInvalid ? 'form-group' : ''">
    <div 
      [class]="{
        'input-group': true, 
        'input-search-box': true, 
        'is-invalid': (isInvalid && validationType === 2), 
        'soft-is-invalid': (isInvalid && validationType === 1)
      }"
      [hidden]="hideInput()">
      
      <input 
        #searchInput 
        aria-label="Label" 
        class="input-text form-control" 
        autofocus
        [matAutocomplete]="autoComplete" 
        (keyup)="onKeyup($event)" 
        (input)="onInputChange($event)"
        [placeholder]="inputPlaceholder" 
        [readonly]="isSearchInProgress"
        id="employeeSearch"
        style="background-color: #FAFDFC;">

      <div class="input-group-append" (click)="searchOnClick()" (keyup)="onKeyup($event)">
        <span class="input-group-text no-border-left" title="search">
          <i *ngIf="isSearchInProgress" class="once-loader once-loader-xs"></i>
          <i *ngIf="!isSearchInProgress" class="icon icon-search"></i>
        </span>
      </div>
    </div>

    <mat-autocomplete 
      #autoComplete="matAutocomplete"
      [displayWith]="usingDisplayValue">
      
      <div class="autocomplete-wrapper">
        @for (option of filteredOptions(); track option.objectAsString) {
          <mat-option 
            [value]="option" 
            matTooltipClass="tooltip" 
            [matTooltip]="option.displayValue"
            class="option-style-truncate">
            
            <mat-checkbox 
              [checked]="isOptionSelected(option)"
              (change)="onCheckboxChange(option, $event.checked)"
              (click)="$event.stopPropagation()">
            </mat-checkbox>
            
            {{ option.displayValue }}
          </mat-option>
        }
      </div>

      <mat-option *ngIf="filteredOptions()?.length === 0 && searchInput.value" disabled>
        No results found
      </mat-option>
    </mat-autocomplete>

    <div 
      *ngIf="isInvalid && showValidationMessage"
      [class]="{
        'crm-form-error-feedback': (isInvalid && validationType === 2), 
        'soft-invalid-feedback': (isInvalid && validationType === 1)
      }">
      <i class="icon icon-error"></i>
      {{ errorMessage }}
    </div>
  </div>
</div>
