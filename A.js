
Based on the multi-select pattern, here are the exact changes you need to make in your single-select dropdown:

## **Add `writeValue` method after the constructor:**

```typescript
constructor(
  private readonly lovService: LovServiceInterface,
  private readonly preferences?: PreferenceServiceInterface
) {
  super();
}

// ✅ ADD THIS METHOD HERE
override writeValue(value: T): void {
  console.log('🔽 writeValue called with:', value);
  
  if (value) {
    // Simply set the value - don't try to match against items yet
    this.selectedValue = value;
    this.selectedItem = value;
    this._selectedItem = value;
    
    console.log('✅ Value set:', this.selectedValue);
  } else {
    this.selectedValue = null;
    this.selectedItem = null;
    this._selectedItem = null;
  }
}
```

## **Fix the `_selectedItem` property declaration:**

Change this:
```typescript
private selectedItem: T | null = null;  // ❌ Wrong - conflicts with getter/setter
```

To this:
```typescript
private _selectedItem: T | null = null;  // ✅ Correct - with underscore
```

## **Update the getter/setter to use `_selectedItem`:**

```typescript
@Input()
set selectedItem(value: T | null) {
  this._selectedItem = value;  // ✅ Use _selectedItem with underscore
  this.selectedItemChange.emit(value);
}

get selectedItem(): T | null {
  return this._selectedItem;  // ✅ Use _selectedItem with underscore
}
```

## **Update `loadLovData` to handle existing selectedValue:**

Replace your existing `loadLovData` method with this:

```typescript
loadLovData(): void {
  // If items already provided (hardcoded source), skip API call
  if (this.items && this.items.length > 0) {
    this.setupPreferencesSubscription(); // Still setup preference if available
    return;
  }

  // Load from API only if type is defined
  if (this.lovType) {
    this.lovService.getLovData(this.lovType).subscribe(
      createObserver<ListOfValues[]>((data) => {
        if (this.hasAll) {
          data.splice(0, 0, this.defaultLov);
        }
        this.items = data as unknown as T[];
        
        console.log('✅ LOV items loaded:', this.items);
        
        // ✅ ADD THIS: If we have a selectedValue, try to match it with loaded items
        if (this.selectedValue && this.items.length > 0) {
          const matchedItem = this.findMatchingItem(this.selectedValue);
          if (matchedItem) {
            console.log('🔄 Matched selected value to loaded item:', matchedItem);
            this.selectedValue = matchedItem;
            this.selectedItem = matchedItem;
          }
        }
        
        this.setupPreferencesSubscription();
      }, 'Lov Data')
    );
  }
}
```

## **Add helper method to find matching item (add after `loadLovData`):**

```typescript
// ✅ ADD THIS NEW METHOD
private findMatchingItem(value: T): T | null {
  if (!this.items || this.items.length === 0) return null;
  
  return this.items.find(item => {
    const itemLov = item as any;
    const valueLov = value as any;
    
    // Try matching by value
    if (itemLov.value && valueLov.value) {
      return itemLov.value === valueLov.value;
    }
    
    // Try matching by orderBy
    if (itemLov.orderBy && valueLov.orderBy) {
      return itemLov.orderBy === valueLov.orderBy;
    }
    
    // Try matching by valueAndDescription
    if (itemLov.valueAndDescription && valueLov.valueAndDescription) {
      return itemLov.valueAndDescription === valueLov.valueAndDescription;
    }
    
    // Fallback to direct comparison
    return item === value;
  }) || null;
}
```

## **Fix the `setupPreferencesSubscription` condition:**

Change this line:
```typescript
if (!this.usePreference || !this.preferences || !this.lovType || !this.moduleName) {
```

To this:
```typescript
if (!this.usePreference || !this.preferences || !this.lovType || !this.moduleName) {
```

(Fix the typo: `usePreference` should be consistent - pick either `usePreference` or `usePreferences` throughout)

---

## **Complete updated file (key sections):**

```typescript
export class SingleSelectDropdownComponent<T> extends OptionsParentBase<T> implements OnInit, OnChanges {

  @Input() placeholder!: string;
  @Input() items: T[] = [];
  @Input() id!: string;
  @Input() displayProp!: keyof T;
  @Input() disabled: boolean = false;
  @Input() lovType: string = '';
  @Input() hasAll: boolean = false;
  @Input() moduleName: string = '';
  @Input() isEditMode: boolean = true;
  @Input() usePreference: boolean = true;
  @Input() autoSelectFirst: boolean = true;
  @Input() alwaysEditable: boolean = false;
  @Input() enableView: boolean = false;

  private _selectedItem: T | null = null;  // ✅ Fixed with underscore
  matSelect: any;

  @Input()
  set selectedItem(value: T | null) {
    this._selectedItem = value;  // ✅ Use _selectedItem
    this.selectedItemChange.emit(value);
  }

  get selectedItem(): T | null {
    return this._selectedItem;  // ✅ Use _selectedItem
  }

  @Output() selectionChange = new EventEmitter<T>();
  @Output() selectedItemChange = new EventEmitter<T | null>();

  selectedValue: T | null = null;
  defaultLov = new ListOfValuesImpl("Default", "All", "All", "", "", "", "", "", "");

  constructor(
    private readonly lovService: LovServiceInterface,
    private readonly preferences?: PreferenceServiceInterface
  ) {
    super();
  }

  // ✅ ADD THIS METHOD
  override writeValue(value: T): void {
    console.log('🔽 writeValue called with:', value);
    
    if (value) {
      this.selectedValue = value;
      this.selectedItem = value;
      console.log('✅ Value set:', this.selectedValue);
    } else {
      this.selectedValue = null;
      this.selectedItem = null;
    }
  }

  isDropdownDisabled(): boolean {
    if (!this.enableView) {
      return false;
    }
    return this.isDisabled();
  }

  loadLovData(): void {
    if (this.items && this.items.length > 0) {
      this.setupPreferencesSubscription();
      return;
    }

    if (this.lovType) {
      this.lovService.getLovData(this.lovType).subscribe(
        createObserver<ListOfValues[]>((data) => {
          if (this.hasAll) {
            data.splice(0, 0, this.defaultLov);
          }
          this.items = data as unknown as T[];
          
          console.log('✅ LOV items loaded:', this.items);
          
          // ✅ Match existing value with loaded items
          if (this.selectedValue && this.items.length > 0) {
            const matchedItem = this.findMatchingItem(this.selectedValue);
            if (matchedItem) {
              console.log('🔄 Matched value to item:', matchedItem);
              this.selectedValue = matchedItem;
              this.selectedItem = matchedItem;
            }
          }
          
          this.setupPreferencesSubscription();
        }, 'Lov Data')
      );
    }
  }

  // ✅ ADD THIS HELPER METHOD
  private findMatchingItem(value: T): T | null {
    if (!this.items || this.items.length === 0) return null;
    
    return this.items.find(item => {
      const itemLov = item as any;
      const valueLov = value as any;
      
      if (itemLov.value && valueLov.value) {
        return itemLov.value === valueLov.value;
      }
      if (itemLov.orderBy && valueLov.orderBy) {
        return itemLov.orderBy === valueLov.orderBy;
      }
      if (itemLov.valueAndDescription && valueLov.valueAndDescription) {
        return itemLov.valueAndDescription === valueLov.valueAndDescription;
      }
      
      return item === value;
    }) || null;
  }

  // ... rest of your methods remain the same
}
```

These are the **only changes** you need to make. The `writeValue` method is the key - it allows Angular's Reactive Forms to set the value when loading data from the API! 🎯



onOptionSelected(event: MatOption) {
  if (event.selected) {
    // Deselect any previously selected options (safety check)
    this.matSelect?.options.forEach(option => {
      if (option.viewValue !== event.viewValue) {
        option.deselect();
      }
    });

    // Emit the selected item cleanly
    this.selectedItemChange.emit(event.value);
    this.selectionChange.emit(event.value);
  }

  this.onTouched();
}


{{ getDisplayValue(item)?.replace(/\s*-\s*$/, '') }}


const val = keyDetails?.get('greenSustainableField')?.value;

let greenSustainableField = this.writeOpportunity.getValueFromLov(
  val == null
    ? []
    : Array.isArray(val)
    ? val
    : typeof val === 'object' && val.value
    ? [val.value]
    : [val]
);

excel-page.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-excel-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './excel-page.component.html',
  styleUrls: ['./excel-page.component.css']
})
export class ExcelPageComponent {
  data: any[] = [];
  columns: string[] = [];
  fileName = 'data.xlsx'; // will update to uploaded file name if provided
  hasFile = false;

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileName = file.name;
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];

      // defval:'' keeps empty cells instead of dropping keys
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      this.data = json;
      this.columns = this.extractColumns(json);
      this.hasFile = true;
    };

    reader.readAsArrayBuffer(file);
  }

  extractColumns(rows: any[]): string[] {
    const set = new Set<string>();
    rows.forEach(r => Object.keys(r).forEach(k => set.add(k)));
    const cols = Array.from(set);
    // keep a stable order: as-is from first row, then extras
    if (rows.length) {
      const first = Object.keys(rows[0]);
      const extras = cols.filter(c => !first.includes(c));
      return [...first, ...extras];
    }
    return cols;
  }

  addRow() {
    const newRow: any = {};
    this.columns.forEach(c => newRow[c] = '');
    this.data = [...this.data, newRow];
  }

  deleteRow(index: number) {
    const copy = [...this.data];
    copy.splice(index, 1);
    this.data = copy;
  }

  addColumn() {
    const colName = prompt('Enter new column name:');
    if (!colName) return;
    if (!this.columns.includes(colName)) {
      this.columns = [...this.columns, colName];
      this.data = this.data.map(row => ({ ...row, [colName]: row[colName] ?? '' }));
    }
  }

  download() {
    // Ensure every row has all columns (avoids missing keys)
    const normalized = this.data.map(r => {
      const obj: any = {};
      this.columns.forEach(c => obj[c] = r[c] ?? '');
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(normalized, { header: this.columns });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const base = this.fileName.replace(/\.(xlsx|xls)$/i, '');
    XLSX.writeFile(workbook, `${base}_updated.xlsx`);
  }

  clear() {
    this.data = [];
    this.columns = [];
    this.hasFile = false;
    this.fileName = 'data.xlsx';
  }
}



excel-page.component.html

<div style="max-width: 1100px; margin: 24px auto; padding: 12px;">
  <h2>Excel Editor (No Backend)</h2>

  <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin: 12px 0;">
    <input type="file" accept=".xlsx,.xls" (change)="onFileChange($event)" />
    <button (click)="addRow()" [disabled]="!columns.length">Add Row</button>
    <button (click)="addColumn()" [disabled]="!hasFile">Add Column</button>
    <button (click)="download()" [disabled]="!hasFile">Download Updated Excel</button>
    <button (click)="clear()" [disabled]="!hasFile">Clear</button>
  </div>

  <div *ngIf="!hasFile" style="opacity: 0.8; margin-top: 8px;">
    <em>Upload an Excel file to start editing.</em>
  </div>

  <div *ngIf="columns.length" style="overflow: auto; border: 1px solid #ddd; border-radius: 8px;">
    <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
      <thead>
        <tr>
          <th *ngFor="let col of columns" style="text-align: left; padding: 8px; border-bottom: 1px solid #eee;">
            {{ col }}
          </th>
          <th style="padding: 8px; border-bottom: 1px solid #eee;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of data; let i = index" style="border-top: 1px solid #f3f3f3;">
          <td *ngFor="let col of columns" style="padding: 6px;">
            <input [(ngModel)]="row[col]" style="width: 100%; box-sizing: border-box;" />
          </td>
          <td style="padding: 6px; white-space: nowrap;">
            <button (click)="deleteRow(i)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <p *ngIf="hasFile" style="margin-top: 10px; opacity: 0.8;">
    File: <strong>{{ fileName }}</strong>
  </p>
</div>



excel-page.component.css

button {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  cursor: pointer;
  background: #fff;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
input[type="file"] {
  border: 1px dashed #ccc;
  padding: 6px;
  border-radius: 8px;
}
table input {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}



