
Here's the complete corrected code with the proper CSS and fix for the duplicate display issue:
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
  
  override ngOnInit(): void {
    super.ngOnInit();
    // Don't show initial items in dropdown
    this.filteredOptions.set([]);
  }
  
  ngAfterViewInit(): void {
    if (this.addInitialItemsCallback) {
      const initialItems = this.addInitialItemsCallback().map(
        result => new OptionInfo(result, this.getViewValue(result))
      );
      this.selectedItemsInternal.set(initialItems);
      this.updateVisibleChips();
      this.onChange(this.selectedItems());
    }
    // Ensure dropdown is closed on init
    this.filteredOptions.set([]);
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
    }, 100);
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
2. HTML Template (Same as before)
employee-multi-select-search.component.html
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
3. Fixed CSS (Perfect styling with rounded borders)
employee-multi-select-search.component.scss
.employee-multi-select-container {
  width: 100%;
  
  ::ng-deep {
    .mat-mdc-text-field-wrapper {
      padding: 0;
    }
    
    .mat-mdc-form-field-flex {
      align-items: center;
    }
    
    .mat-mdc-form-field-infix {
      padding: 8px 0;
      min-height: 48px;
      border: 0;
    }
    
    // Rounded border styling
    .mat-mdc-form-field-outline {
      .mdc-notched-outline__leading,
      .mdc-notched-outline__notch,
      .mdc-notched-outline__trailing {
        border-color: rgba(0, 0, 0, 0.12);
        border-width: 1px;
      }
    }
    
    .mat-mdc-form-field-outline-start {
      border-radius: 4px 0 0 4px;
      min-width: 12px;
    }
    
    .mat-mdc-form-field-outline-end {
      border-radius: 0 4px 4px 0;
    }
  }
  
  .mat-mdc-chip-grid {
    width: 100%;
    margin: 0;
  }
  
  .chip-style {
    background-color: #e3f2fd;
    color: #1976d2;
    font-size: 13px;
    height: 28px;
    margin: 2px 4px;
    padding: 0 8px;
    border-radius: 14px;
    
    ::ng-deep {
      .mat-mdc-chip-action-label {
        padding: 0 8px;
        font-size: 13px;
      }
      
      .mdc-evolution-chip__text-label {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    &.remaining-count-chip {
      background-color: #f5f5f5;
      color: #666;
      cursor: pointer;
      
      &:hover {
        background-color: #e0e0e0;
      }
    }
    
    button[matChipRemove] {
      margin: 0 0 0 4px;
      opacity: 0.7;
      width: 18px;
      height: 18px;
      
      i {
        font-size: 14px;
      }
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
  input {
    border: none;
    outline: none;
    min-width: 150px;
    height: 32px;
    padding: 4px 8px;
    font-size: 14px;
    
    &::placeholder {
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }
  }
  
  .once-loader {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
  }
}

// Autocomplete dropdown styles
::ng-deep {
  .mat-mdc-autocomplete-panel {
    max-height: 300px;
    border-radius: 4px;
    box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);
    
    .multi-select-option {
      padding: 0 !important;
      height: auto !important;
      min-height: 40px;
      
      .mdc-list-item__primary-text {
        width: 100%;
      }
      
      .option-checkbox {
        width: 100%;
        padding: 10px 16px;
        margin: 0;
        display: flex;
        align-items: center;
        
        .mdc-checkbox {
          margin-right: 12px;
        }
        
        .mdc-label {
          width: 100%;
          cursor: pointer;
          font-size: 14px;
          line-height: 1.4;
        }
      }
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
      
      &.mdc-list-item--selected {
        background-color: rgba(63, 81, 181, 0.08);
      }
    }
    
    .no-results-option {
      padding: 12px 16px;
      color: #666;
      font-style: italic;
      font-size: 14px;
      text-align: center;
    }
  }
}

// Validation styles
.is-invalid {
  ::ng-deep {
    .mat-mdc-form-field-outline {
      .mdc-notched-outline__leading,
      .mdc-notched-outline__notch,
      .mdc-notched-outline__trailing {
        border-color: #dc3545 !important;
        border-width: 2px !important;
      }
    }
  }
}

.soft-is-invalid {
  ::ng-deep {
    .mat-mdc-form-field-outline {
      .mdc-notched-outline__leading,
      .mdc-notched-outline__notch,
      .mdc-notched-outline__trailing {
        border-color: #ffc107 !important;
        border-width: 2px !important;
      }
    }
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
    font-size: 16px;
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
    font-size: 16px;
  }
}

// Tooltip styling
.tooltip {
  font-size: 12px;
  max-width: 300px;
  white-space: pre-line;
  line-height: 1.5;
}
Key Fixes:
✅ Fixed duplicate display issue - Added ngOnInit to clear filteredOptions on component initialization
✅ Perfect rounded borders - Added proper Material Design outline styling
✅ Compact size - Reduced padding and chip sizes to match email-chips component
✅ Better chip styling - Smaller, more compact chips with proper spacing
✅ No initial dropdown - Prevents showing pre-selected items when opening
✅ Smooth borders - Properly rounded corners on all sides
✅ Better input sizing - Proper height and padding for search input
The duplicate "CRMDEV4 CRMDEV4" issue was happening because the addInitialItemsCallback was being shown in the dropdown on component init. Now it's fixed by clearing the filtered options on initialization! 🎉
