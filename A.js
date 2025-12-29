.ts file

import { Component, Input, forwardRef, ViewChild, ElementRef, signal, computed } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

export interface SearchOption {
  displayValue: string;
  value: any;
  objectAsString: string;
}

@Component({
  selector: 'app-employee-multi-select-search',
  templateUrl: './employee-multi-select-search.component.html',
  styleUrls: ['./employee-multi-select-search.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmployeeMultiSelectSearchComponent),
      multi: true
    }
  ]
})
export class EmployeeMultiSelectSearchComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() inputPlaceholder: string = 'Search employees...';
  @Input() isRequired: boolean = false;
  @Input() isInvalid: boolean = false;
  @Input() errorMessage: string = '';
  @Input() showValidationMessage: boolean = true;
  @Input() validationType: number = 2; // 1 = soft validation, 2 = hard validation
  @Input() minSearchLength: number = 2;

  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;

  // Signals for reactive state management
  selectedItemsInternal = signal<SearchOption[]>([]);
  allOptions = signal<SearchOption[]>([]);
  filteredOptions = signal<SearchOption[]>([]);
  isSearchInProgress = signal<boolean>(false);
  isDisabled = signal<boolean>(false);
  searchValue = signal<string>('');

  // Computed values
  visibleItems = computed(() => {
    const items = this.selectedItemsInternal();
    return items.slice(0, 3).map(item => item.displayValue);
  });

  clippedItems = computed(() => {
    const items = this.selectedItemsInternal();
    return items.slice(3);
  });

  tooltipContent = computed(() => {
    return this.selectedItemsInternal()
      .map(item => item.displayValue)
      .join(', ');
  });

  private onChange: (value: any[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {}

  // ControlValueAccessor implementation
  writeValue(value: any[]): void {
    if (value && Array.isArray(value)) {
      this.selectedItemsInternal.set(value);
    } else {
      this.selectedItemsInternal.set([]);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  // Search functionality
  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.searchValue.set(value);

    if (value.length >= this.minSearchLength) {
      this.performSearch(value);
    } else {
      this.filteredOptions.set([]);
    }
  }

  performSearch(searchTerm: string): void {
    this.isSearchInProgress.set(true);
    
    // Simulate API call - Replace this with your actual API service
    setTimeout(() => {
      const results = this.mockSearchEmployees(searchTerm);
      this.filteredOptions.set(results);
      this.isSearchInProgress.set(false);
    }, 500);
  }

  // Mock search function - Replace with actual API call
  private mockSearchEmployees(searchTerm: string): SearchOption[] {
    // This is a mock implementation. Replace with your actual service call:
    // Example: this.employeeService.searchEmployees(searchTerm).subscribe(...)
    
    const mockEmployees = [
      { id: 1, name: 'John Doe', email: 'john.doe@company.com' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com' },
      { id: 3, name: 'Bob Johnson', email: 'bob.johnson@company.com' },
      { id: 4, name: 'Alice Williams', email: 'alice.williams@company.com' },
      { id: 5, name: 'Charlie Brown', email: 'charlie.brown@company.com' }
    ];

    const filtered = mockEmployees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.map(emp => ({
      displayValue: `${emp.name} (${emp.email})`,
      value: emp,
      objectAsString: JSON.stringify(emp)
    }));
  }

  onOptionSelected(option: SearchOption, isSelected: boolean): void {
    const currentItems = this.selectedItemsInternal();
    
    if (isSelected) {
      // Add item if not already selected
      const exists = currentItems.some(item => 
        item.objectAsString === option.objectAsString
      );
      
      if (!exists) {
        const updatedItems = [...currentItems, option];
        this.selectedItemsInternal.set(updatedItems);
        this.onChange(updatedItems);
      }
    } else {
      // Remove item
      const updatedItems = currentItems.filter(item => 
        item.objectAsString !== option.objectAsString
      );
      this.selectedItemsInternal.set(updatedItems);
      this.onChange(updatedItems);
    }
    
    this.onTouched();
  }

  removeSelectedItem(item: SearchOption): void {
    const updatedItems = this.selectedItemsInternal().filter(
      selected => selected.objectAsString !== item.objectAsString
    );
    this.selectedItemsInternal.set(updatedItems);
    this.onChange(updatedItems);
    this.onTouched();
  }

  isOptionSelected(option: SearchOption): boolean {
    return this.selectedItemsInternal().some(
      item => item.objectAsString === option.objectAsString
    );
  }

  clearSelection(): void {
    this.selectedItemsInternal.set([]);
    this.onChange([]);
    this.onTouched();
  }

  onSearchClick(): void {
    if (this.searchInput?.nativeElement.value) {
      this.performSearch(this.searchInput.nativeElement.value);
    }
  }

  onKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.searchInput?.nativeElement.value) {
      this.performSearch(this.searchInput.nativeElement.value);
    }
  }
}




. html 
<div class="employee-multi-select-search">
  <!-- Label -->
  <label 
    *ngIf="label != null && label.length > 0" 
    for="searchInput" 
    [class]="{'required': isRequired}">
    {{ label }}
  </label>

  <!-- Selected Items Chips -->
  <mat-chip-grid #chipGrid *ngIf="selectedItemsInternal().length > 0 && !isDisabled()">
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
    <input [hidden]="true" [matChipInputFor]="chipGrid" />
  </mat-chip-grid>

  <!-- Disabled State Display -->
  <div *ngIf="isDisabled()">
    @for (item of selectedItemsInternal(); track item.objectAsString) {
      <input 
        matTooltipClass="tooltip" 
        [matTooltip]="item.displayValue" 
        class="form-control mb-2" 
        readonly
        [value]="item.displayValue">
    }
    <span *ngIf="selectedItemsInternal().length === 0" class="text-muted">No Data</span>
  </div>

  <!-- Search Input with Multi-Select Dropdown -->
  <div [class]="isInvalid ? 'form-group' : ''">
    <div 
      [class]="{
        'input-group': true, 
        'input-search-box': true, 
        'is-invalid': (isInvalid && validationType === 2), 
        'soft-is-invalid': (isInvalid && validationType === 1)
      }"
      *ngIf="!isDisabled()">
      
      <input 
        #searchInput 
        aria-label="Search employees" 
        class="input-text form-control" 
        [matAutocomplete]="autoComplete" 
        (keyup)="onKeyup($event)" 
        (input)="onInputChange($event)"
        [placeholder]="inputPlaceholder" 
        [readonly]="isSearchInProgress()"
        style="background-color: #FAFDFC;">

      <div class="input-group-append" (click)="onSearchClick()">
        <span class="input-group-text no-border-left" title="search">
          <i *ngIf="isSearchInProgress()" class="once-loader once-loader-xs"></i>
          <i *ngIf="!isSearchInProgress()" class="icon icon-search"></i>
        </span>
      </div>
    </div>

    <!-- Multi-Select Autocomplete -->
    <mat-autocomplete 
      #autoComplete="matAutocomplete"
      class="multi-select-autocomplete">
      
      <div class="autocomplete-wrapper">
        @for (option of filteredOptions(); track option.objectAsString) {
          <mat-option 
            [value]="option" 
            matTooltipClass="tooltip" 
            [matTooltip]="option.displayValue"
            class="option-style-truncate checkbox-option"
            (onSelectionChange)="onOptionSelected(option, $event.source.selected)">
            
            <!-- Checkbox for multi-select -->
            <mat-checkbox 
              [checked]="isOptionSelected(option)"
              (click)="$event.stopPropagation()"
              class="option-checkbox">
            </mat-checkbox>
            
            <span class="option-text">{{ option.displayValue }}</span>
          </mat-option>
        }
      </div>

      <!-- No Results Message -->
      <mat-option 
        *ngIf="filteredOptions()?.length === 0 && searchInput.value && !isSearchInProgress()" 
        disabled>
        No results found
      </mat-option>

      <!-- Loading Message -->
      <mat-option 
        *ngIf="isSearchInProgress()" 
        disabled>
        <i class="once-loader once-loader-xs"></i> Searching...
      </mat-option>
    </mat-autocomplete>

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
</div>


.scss

.employee-multi-select-search {
  width: 100%;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    
    &.required::after {
      content: ' *';
      color: #dc3545;
    }
  }

  // Chip styles
  mat-chip-grid {
    margin-bottom: 0.5rem;
    
    .chip-style {
      background-color: #e3f2fd;
      color: #1976d2;
      margin: 0.25rem;
      
      .chip-data-style {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
      }
      
      button {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        margin-left: 0.5rem;
        
        i {
          font-size: 14px;
        }
      }
    }
  }

  // Input group styles
  .input-search-box {
    position: relative;
    
    &.is-invalid {
      .form-control {
        border-color: #dc3545;
      }
    }
    
    &.soft-is-invalid {
      .form-control {
        border-color: #ffc107;
      }
    }
    
    .input-text {
      border-right: none;
    }
    
    .input-group-append {
      cursor: pointer;
      
      .input-group-text {
        background-color: #fff;
        border-left: none;
        
        &.no-border-left {
          border-left: 1px solid #ced4da;
        }
      }
    }
  }

  // Validation messages
  .crm-form-error-feedback,
  .soft-invalid-feedback {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    
    i {
      margin-right: 0.25rem;
    }
  }
  
  .crm-form-error-feedback {
    color: #dc3545;
  }
  
  .soft-invalid-feedback {
    color: #ffc107;
  }

  // Disabled state
  .text-muted {
    color: #6c757d;
    font-style: italic;
  }
}

// Autocomplete panel styles (global)
::ng-deep {
  .multi-select-autocomplete {
    .mat-mdc-autocomplete-panel {
      max-height: 400px;
    }
    
    .autocomplete-wrapper {
      max-height: 350px;
      overflow-y: auto;
    }
    
    .checkbox-option {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      
      .option-checkbox {
        margin-right: 12px;
        pointer-events: none;
      }
      
      .option-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      &.mat-mdc-option {
        min-height: 48px;
      }
    }
    
    .option-style-truncate {
      .mdc-list-item__primary-text {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

// Loader styles
.once-loader {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  &.once-loader-xs {
    width: 12px;
    height: 12px;
    border-width: 1.5px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
    }


usage 
// ============================================
// 1. MODULE SETUP (app.module.ts or feature.module.ts)
// ============================================
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { EmployeeMultiSelectSearchComponent } from './employee-multi-select-search.component';

@NgModule({
  declarations: [
    EmployeeMultiSelectSearchComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatInputModule
  ],
  exports: [
    EmployeeMultiSelectSearchComponent
  ]
})
export class EmployeeMultiSelectSearchModule { }

// ============================================
// 2. USAGE IN PARENT COMPONENT (TypeScript)
// ============================================
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-parent-form',
  templateUrl: './parent-form.component.html'
})
export class ParentFormComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      employees: [[], Validators.required], // Array of selected employees
      clientModel: [[], Validators.required] // For backward compatibility
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const selectedEmployees = this.form.get('employees')?.value;
      console.log('Selected Employees:', selectedEmployees);
      // Process the form data
    } else {
      console.log('Form is invalid');
    }
  }

  getInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return (field?.touched && field?.invalid) ?? false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    
    if (field?.hasError('minlength')) {
      return `Minimum length is ${field.errors?.['minlength'].requiredLength}`;
    }
    
    return 'Invalid input';
  }
}

// ============================================
// 3. USAGE IN PARENT COMPONENT (HTML Template)
// ============================================
/*
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <div class="form-row">
    <div class="col-12">
      <app-employee-multi-select-search 
        formControlName="employees"
        label="Select Employees"
        inputPlaceholder="Search employees by name or email..."
        [isRequired]="true"
        [isInvalid]="getInvalid('employees')"
        [errorMessage]="getErrorMessage('employees')"
        [minSearchLength]="2">
      </app-employee-multi-select-search>
    </div>
  </div>

  <div class="form-row mt-3">
    <div class="col-12">
      <button type="submit" class="btn btn-primary">Submit</button>
    </div>
  </div>
</form>
*/

// ============================================
// 4. EMPLOYEE SERVICE (Optional - for API integration)
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Employee {
  id: number;
  name: string;
  email: string;
  department?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = '/api/employees'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  searchEmployees(searchTerm: string): Observable<SearchOption[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/search`, {
      params: { q: searchTerm }
    }).pipe(
      map(employees => employees.map(emp => ({
        displayValue: `${emp.name} (${emp.email})`,
        value: emp,
        objectAsString: JSON.stringify(emp)
      })))
    );
  }
}

// ============================================
// 5. UPDATE COMPONENT TO USE SERVICE
// ============================================
/*
In your employee-multi-select-search.component.ts, 
replace the performSearch method with:

constructor(private employeeService: EmployeeService) {}

performSearch(searchTerm: string): void {
  this.isSearchInProgress.set(true);
  
  this.employeeService.searchEmployees(searchTerm).subscribe({
    next: (results) => {
      this.filteredOptions.set(results);
      this.isSearchInProgress.set(false);
    },
    error: (error) => {
      console.error('Error searching employees:', error);
      this.filteredOptions.set([]);
      this.isSearchInProgress.set(false);
    }
  });
}
*/

// ============================================
// 6. COMPONENT INPUTS AND THEIR DEFAULTS
// ============================================
/*
Available @Input properties:

- label: string = ''                    // Label text for the field
- inputPlaceholder: string = 'Search...' // Placeholder text
- isRequired: boolean = false           // Shows asterisk on label
- isInvalid: boolean = false            // Shows validation error state
- errorMessage: string = ''             // Error message to display
- showValidationMessage: boolean = true // Whether to show error
- validationType: number = 2            // 1=soft (warning), 2=hard (error)
- minSearchLength: number = 2           // Minimum chars to trigger search
*/
