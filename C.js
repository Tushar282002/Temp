Here's the corrected code with all your requirements:
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
   * Display format for items - use property names from your employee object
   */
  @Input() override displayMemberPath = '{fullName} ({emailAddress})';
  
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
    
    if (!optionInfo) return;
    
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
    
    // Clear the input after selection
    if (inputElement) {
      inputElement.value = '';
    }
    
    // Clear filtered options to hide dropdown
    setTimeout(() => {
      this.filteredOptions.set([]);
    }, 0);
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
2. Fixed HTML Template (Removed label, fixed no results message)
employee-multi-select-search.component.html
<div [class]="isInvalid ? 'form-group' : ''">
  <mat-form-field 
    appearance="outline" 
    class="email-chips-container"
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
        [displayWith]="getDisplayValue"
        (optionSelected)="onOptionSelected($event.option, searchInput)">
        
        @for (option of filteredOptions(); track option.objectAsString) {
          <mat-option 
            [value]="option"
            class="multi-select-option">
            <mat-checkbox 
              [checked]="isOptionSelected(option)"
              (click)="$event.stopPropagation(); onCheckboxClick($event, option)"
              class="option-checkbox">
              {{ option.displayValue }}
            </mat-checkbox>
          </mat-option>
        }
        
        <!-- No Results Message - Only show after search -->
        @if (filteredOptions()?.length === 0 && searchInput.value && !isSearchInProgress) {
          <mat-option disabled class="no-results-option">
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
3. Fixed CSS (Same as email-chips)
employee-multi-select-search.component.scss
.email-chips-container {
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
::ng-deep {
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
    
    .no-results-option {
      padding: 8px 16px;
      color: #666;
      font-style: italic;
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
  white-space: pre-line;
}
4. Updated Usage (Add label in parent HTML)
<div class="form-row">
  <div class="col-12">
    <label for="BnppParticipants" class="required label-style">
      BNPP Participants
    </label>
    <app-employee-multi-select-search 
      id="BnppParticipants"
      [searchItemsCallback]="searchEmployeesForOpportunities.bind(this)"
      [addInitialItemsCallback]="addCurrentUserAsParticipant.bind(this)"
      formControlName="bnppParticipants" 
      inputPlaceholder="Search by employee name"
      [isInvalid]="(form.get('bnppParticipants')?.touched && form.get('bnppParticipants')?.invalid) ?? false"
      [errorMessage]="getErrorMessage('bnppParticipants')"
      displayMemberPath="{fullName} ({emailAddress})"
      noResultsMessage="No results found in Employee Directory">
    </app-employee-multi-select-search>
  </div>
</div>
Key Changes Made:
✅ Removed label from component - Now you add it in parent HTML
✅ Fixed displayMemberPath - Use {fullName} ({emailAddress}) instead of firstName/lastName
✅ Fixed "undefined" issue - Now uses correct property names from your employee object
✅ No pre-selected item visible - Clears filtered options after selection
✅ Saves on checkbox click - Selection is saved immediately
✅ Same CSS as email-chips - Uses email-chips-container class
✅ No results only after search - Added condition && !isSearchInProgress
✅ Proper checkbox behavior - Click on checkbox toggles selection
Note: Make sure your employee object has a fullName property. If it doesn't, use {firstName} {lastName} ({emailAddress}) in the displayMemberPath input.
