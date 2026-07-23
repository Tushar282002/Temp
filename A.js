import {
  IsExternalFilterPresent,
  DoesExternalFilterPass,
  IRowNode,
} from 'ag-grid-community';

isExternalFilterPresent: IsExternalFilterPresent = (): boolean => {
  return (
    (this.selectedStatuses?.length ?? 0) > 0 ||
    (this.selectedClassifications?.length ?? 0) > 0 ||
    !!this.productFilterCtrl.value?.length ||
    !!this.filterText.value ||
    !!this.currentSelectedTagsId?.length ||
    this.clickedCardNumber() !== undefined
  );
};

doesExternalFilterPass: DoesExternalFilterPass<IOpportunityModelBase> = (
  node: IRowNode<IOpportunityModelBase>
): boolean => {
  const row = node.data;
  if (!row) return true;

  if (this.clickedCardNumber() !== undefined && !this.passesCardFilter(row)) return false;
  if (!this.passesStatusFilter(row)) return false;
  if (!this.passesClassificationFilter(row)) return false;
  if (!this.passesProductFilter(row)) return false;
  if (!this.passesSearchFilter(row)) return false;
  if (!this.passesTagFilter(row)) return false;

  return true;
};


private passesStatusFilter(row: IOpportunityModelBase): boolean {
  if (this.wasAllStatusSelected() || this.selectedStatuses.length === 0) return true;

  const stages = this.selectedStatuses.map(s => s.value.split(',')[0]?.trim());
  const statuses = this.selectedStatuses
    .map(s => s.value.split(',')[1]?.trim())
    .filter(Boolean);

  if (stages.length && (row.stage === undefined || !stages.includes(row.stage))) return false;

  if (statuses.length) {
    const isClosed = row.stage === getOpportunitySiebelStageTypeDescription(OpportunityStageType.Closed);
    if (isClosed) return statuses.includes(row.status ?? '');
  }
  return true;
  }


private applyFilters(): void {
  if (this.gridApi && !this.gridApi.isDestroyed()) {
    this.gridApi.onFilterChanged();
  }
  this.SetupCardData();
}

[rowData]="rowData()"
[isExternalFilterPresent]="isExternalFilterPresent"
[doesExternalFilterPass]="doesExternalFilterPass"






see I am working on clients module and in this module there is a search bar and below it there is a grid which displays the data.

So when I am searching any text in search bar it filters it out shows only that row which matches with it.

Now issue is that this a detailed row group means there is expander of some rows and in this expansion there is crds code and crds name and also in some row group expansion there is another expansion called as other nle

So when I search any crds code or name in the search bar then it filters out properly but the row is not expanding automatically we have to expand it if the search text is present in row group and also expand other nle if there is a crds code matching 

So issue is that row expansion is not working properly when searching text and there should be no highlight come on searching that is working properly only work on row expansion.

I have shared the code above let me know if you want any other codes



It is working properly just one small issue is that 

If I searched the crds code let's abc which is present in first row expansion and it also contains other nles section, so when I search abc then it should expand only first row not other nles section. Only fix this rest is working fine 



I will explain the sceniro let's see row head name is test and in that it contains contains crds codes and uat and dev and other nle section also and in other nle section it has prod as crds code 

So when I search prod then only it should expand other nle section otherwise not. And when I search uat/ dev then it should expand test row only and other nle section should not expand



onGridRowDataUpdated(event?: any): void {
  this.syncRowExpansion();
}

private syncRowExpansion(): void {
  const term = (this.currentSearchTerm ?? '').trim();
  if (!this.gridApi) return;

  this.gridApi.forEachNode((masterNode) => {
    const data = masterNode.data as IMarketingClient;
    const crdsCodes = data?.crdsCodes ?? [];

    const masterHasMatch =
      !!term && crdsCodes.some((c: any) => searchObjectProperties(c, term));
    masterNode.setExpanded(masterHasMatch);

    // If this row's crdsCodes detail grid already exists (was previously
    // expanded), sync its inner NLE expansion state too — onFirstDataRendered
    // won't refire on an existing grid, so we must update it manually.
    const detailInfo = this.gridApi.getDetailGridInfo(`detail_${masterNode.id}`);
    const detailApi = detailInfo?.api;
    if (detailApi) {
      detailApi.forEachNode((crdsNode: any) => {
        const nleMatch =
          !!term && crdsNode.data?.nonLegalEntities?.some((nle: any) =>
            searchObjectProperties(nle, term)
          );
        crdsNode.setExpanded(nleMatch);
      });
    }
  });
}onFirstDataRendered: (params: any) => {
  const term = (this.currentSearchTerm ?? '').trim();

  params.api.forEachNode((node: any) => {
    const nleMatch =
      !!term && node.data?.nonLegalEntities?.some((nle: any) =>
        searchObjectProperties(nle, term)
      );
    node.setExpanded(nleMatch);
  });
},








private gridApi!: GridApi;
private currentSearchTerm = '';

clientGridReady(event: any): void {
  this.gridApi = event.api;
}

onGridRowDataUpdated(): void {
  this.expandMatchingRows();
}

private expandMatchingRows(): void {
  const term = (this.currentSearchTerm ?? '').trim();
  if (!term || !this.gridApi) return;

  this.gridApi.forEachNode((node) => {
    const data = node.data as IMarketingClient;
    if (!data?.crdsCodes?.length) return;

    const hasMatch = data.crdsCodes.some((c: any) => searchObjectProperties(c, term));
    if (hasMatch) {
      node.setExpanded(true);
    }
  });
}



const filtersForm = filters.form;
this.currentSearchTerm = filtersForm?.get(clientFilterKeys.search)?.value ?? '';


detailCellRendererParams = computed(() => {
  const innerDetailParams = {
    detailGridOptions: {
      columnDefs: [
        { field: 'crdsCode', headerName: 'CRDS Code', sortable: true },
        { field: 'crdsName', headerName: 'CRDS Name', minWidth: 400, flex: 1, sortable: true },
      ],
      masterDetail: false,
    },
    getDetailRowData: (innerParams: any) =>
      innerParams.successCallback(innerParams.data?.nonLegalEntities),
  };

  return {
    detailGridOptions: {
      columnDefs: [
        { cellRenderer: 'agGroupCellRenderer', width: 20 },
        { field: 'crdsCode', headerName: 'CRDS Code', sortable: true },
        { field: 'crdsName', headerName: 'CRDS Name', minWidth: 400, flex: 1, sortable: true },
      ],
      masterDetail: true,
      detailCellRendererParams: innerDetailParams,
      isRowMaster: (param: any): boolean => {
        const row = param as CrdsEntity;
        return !!row?.nonLegalEntities?.length;
      },
      getDetailRowData: (params: any) =>
        params.successCallback(params.data?.crdsCodes),

      // NEW — expand NLE rows whose crdsCode/crdsName matched the search term
      onFirstDataRendered: (params: any) => {
        const term = (this.currentSearchTerm ?? '').trim();
        if (!term) return;

        params.api.forEachNode((node: any) => {
          if (searchObjectProperties(node.data, term)) {
            node.setExpanded(true);
          }
        });
      },
    } as GridOptions,
  };
});











// plain method — reusable, callable directly
private runSearchExpansion(term: string): void {
  const t = term.toLowerCase();
  if (!this.gridApi) return;

  this.gridApi.setGridOption('findSearchValue', t);
  this.gridApi.forEachNode((node) => {
    const client = node.data as IMarketingClient;
    if (!client) return;
    const level = this.findMatchLevel(client, t);
    node.setExpanded(level === 1 || level === 2);
  });

  (this.gridApi as any).forEachDetailGridInfo?.((info: any) => {
    const detailApi = info.api;
    if (!detailApi) return;
    detailApi.setGridOption('findSearchValue', t);
    detailApi.forEachNode((n: any) => {
      const crds = n.data as CrdsEntity;
      const hasNle = !!t && (crds.nonLegalEntities ?? []).some(
        (x: any) => (x.crdsCode ?? '').toLowerCase().includes(t) || (x.crdsName ?? '').toLowerCase().includes(t),
      );
      n.setExpanded(hasNle);
    });
    (detailApi as any).forEachDetailGridInfo?.((inner: any) => inner.api?.setGridOption('findSearchValue', t));
  });
}

// effect just reacts to the signal and delegates
private readonly searchExpansionEffect = effect(() => {
  const term = this.searchTerm();
  this.runSearchExpansion(term ?? '');
});



private findMatchLevel(client: IMarketingClient, term: string): 0 | 1 | 2 | -1 {
  const t = term.trim().toLowerCase();
  if (!t) return -1;

  // level 0 — does the match appear in any visible top-level column?
  const clientMatches = this.columnDefs.some((col) => {
    const field = (col as any).field as string | undefined;
    if (!field) return false;
    const value = (client as any)[field];
    return value != null && value.toString().toLowerCase().includes(t);
  });
  if (clientMatches) return 0;

  // level 1 & 2 — walk the crdsCodes tree
  for (const crds of client.crdsCodes ?? []) {
    const nleMatch = (crds.nonLegalEntities ?? []).some(
      (n) => (n.crdsCode ?? '').toLowerCase().includes(t) || (n.crdsName ?? '').toLowerCase().includes(t),
    );
    if (nleMatch) return 2;

    const crdsMatch = (crds.crdsCode ?? '').toLowerCase().includes(t) || (crds.crdsName ?? '').toLowerCase().includes(t);
    if (crdsMatch) return 1;
  }
  return -1;
}






private findMatchLevel(client: IMarketingClient, term: string): 0 | 1 | 2 | -1 {
  const t = term.trim().toLowerCase();
  if (!t) return -1;

  if ((client.name ?? '').toLowerCase().includes(t)) return 0; // adjust to real field

  for (const crds of client.crdsCodes ?? []) {
    const nleMatch = (crds.nonLegalEntities ?? []).some(
      (n) => (n.crdsCode ?? '').toLowerCase().includes(t) || (n.crdsName ?? '').toLowerCase().includes(t),
    );
    if (nleMatch) return 2;

    const crdsMatch = (crds.crdsCode ?? '').toLowerCase().includes(t) || (crds.crdsName ?? '').toLowerCase().includes(t);
    if (crdsMatch) return 1;
  }
  return -1;
}



private readonly syncSearchExpansion = effect(() => {
  const term = this.searchTerm().toLowerCase();
  if (!this.gridApi) return;

  this.gridApi.setGridOption('findSearchValue', term);
  this.gridApi.forEachNode((node) => {
    const client = node.data as IMarketingClient;
    if (!client) return;
    const level = this.findMatchLevel(client, term);
    node.setExpanded(level === 1 || level === 2); // expand only to reveal a real match
  });

  // any level-2 grids already open
  (this.gridApi as any).forEachDetailGridInfo?.((info: any) => {
    const detailApi = info.api;
    if (!detailApi) return;
    detailApi.setGridOption('findSearchValue', term);
    detailApi.forEachNode((n: any) => {
      const crds = n.data as CrdsEntity;
      const hasNle = !!term && (crds.nonLegalEntities ?? []).some(
        (x: any) => (x.crdsCode ?? '').toLowerCase().includes(term) || (x.crdsName ?? '').toLowerCase().includes(term),
      );
      n.setExpanded(hasNle); // level 3 only expands if the match is actually inside it
    });
    (detailApi as any).forEachDetailGridInfo?.((inner: any) => inner.api?.setGridOption('findSearchValue', term));
  });
});




detailCellRendererParams = computed(() => {
  const term = this.searchTerm().toLowerCase();
  return {
    getDetailRowData: (p: any) => p.successCallback(p.data?.crdsCodes ?? []),
    detailGridOptions: {
      columnDefs: [
        { cellRenderer: 'agGroupCellRenderer', width: 20 },
        { field: 'crdsCode', headerName: 'CRDS Code', sortable: true },
        { field: 'crdsName', headerName: 'CRDS Name', minWidth: 400, flex: 1, sortable: true },
      ],
      masterDetail: true,
      detailRowAutoHeight: true,
      findSearchValue: term,
      isRowMaster: (row: CrdsEntity) => !!row?.nonLegalEntities?.length,
      onFirstDataRendered: (p: any) => {
        if (!term) return;
        p.api.forEachNode((n: any) => {
          const crds = n.data as CrdsEntity;
          n.setExpanded((crds.nonLegalEntities ?? []).some(
            (x: any) => (x.crdsCode ?? '').toLowerCase().includes(term) || (x.crdsName ?? '').toLowerCase().includes(term),
          ));
        });
      },
      detailCellRendererParams: {
        getDetailRowData: (p: any) => p.successCallback(p.data?.nonLegalEntities ?? []),
        detailGridOptions: { columnDefs: [ /* same crdsCode/crdsName cols */ ], masterDetail: false, findSearchValue: term },
      },
    } as GridOptions,
  };
});




using System;
using System.Globalization;
using System.Windows.Data;
using CRM.CRMLite.Common.Windows.Helpers;

namespace CRM.CRMLite.Common.Converters
{
    public class DateTimeInRegionalFormat : IValueConverter
    {
        private static readonly string[] SiebelExplicitFormats =
            { "dd/MM/yyyy HH:mm:ss", "dd/MM/yyyy" };

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null)
                return null;

            return ConvertToRegionalFormat(value);
        }

        private static object ConvertToRegionalFormat(object value)
        {
            var stringValue = System.Convert.ToString(value);

            if (string.IsNullOrWhiteSpace(stringValue))
                return value;

            DateTime returnValue;

            // Try strict Siebel format first (handles raw NewValue strings)
            bool parsed = DateTime.TryParseExact(stringValue, SiebelExplicitFormats,
                CultureInfo.InvariantCulture, DateTimeStyles.None, out returnValue);

            // Fall back to loose parse (handles already-typed DateTime values like ModificationDate)
            if (!parsed)
                parsed = DateTime.TryParse(stringValue, out returnValue);

            if (!parsed || returnValue == DateTime.MinValue)
                return value; // not a date at all (e.g. "ABC, Rakesh") — return original untouched

            return returnValue.ToString(DateHelper.GetCurrentCultureDateTimeFormat());
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}








using System;
using System.Globalization;
using System.Windows.Data;
using CRM.CRMLite.Common.Windows.Helpers;

namespace CRM.CRMLite.Common.Converters
{
    public class DateOnlyInRegionalFormat : IValueConverter
    {
        private static readonly string[] SiebelExplicitFormats =
            { "dd/MM/yyyy HH:mm:ss", "dd/MM/yyyy" };

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null)
                return null;

            var stringValue = System.Convert.ToString(value);

            if (string.IsNullOrWhiteSpace(stringValue))
                return null;

            DateTime returnValue;

            // Try strict Siebel format first (handles raw NewValue strings)
            bool parsed = DateTime.TryParseExact(stringValue, SiebelExplicitFormats,
                CultureInfo.InvariantCulture, DateTimeStyles.None, out returnValue);

            // Fall back to loose parse (handles already-typed DateTime values like ModificationDate)
            if (!parsed)
                parsed = DateTime.TryParse(stringValue, out returnValue);

            if (!parsed || returnValue == DateTime.MinValue)
                return value; // not a date at all (e.g. "ABC, Rakesh") — return original untouched

            return returnValue.ToString(DateHelper.GetCurrentCultureDateFormat());
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}





private void RemoveTeamMembersAddedByCheckbox()
{
    System.Diagnostics.Debug.WriteLine($"=== RemoveTeamMembersAddedByCheckbox called ===");
    System.Diagnostics.Debug.WriteLine($"_teamCheckboxAddedIds count: {_teamCheckboxAddedIds?.Count ?? 0}");
    
    if (_teamCheckboxAddedIds != null)
    {
        foreach (var id in _teamCheckboxAddedIds)
            System.Diagnostics.Debug.WriteLine($"  Tracking ID: '{id}'");
    }

    foreach (var al in AccessList)
        System.Diagnostics.Debug.WriteLine($"  Grid row - EmployeeId: '{al.EmployeeId}', VisibilityRule: '{al.VisibilityRule}', IsManuallyAdded: {al.IsManuallyAdded}");

    if (_teamCheckboxAddedIds == null || _teamCheckboxAddedIds.Count == 0)
    {
        System.Diagnostics.Debug.WriteLine("EARLY EXIT - tracking set empty");
        return;
    }

    Application.Current.Dispatcher.Invoke(() =>
    {
        var toRemove = AccessList
            .Where(al =>
                al.EmployeeId != null &&
                _teamCheckboxAddedIds.Contains(al.EmployeeId) &&
                al.VisibilityRule?.Trim().Equals(
                    "Manually Added", StringComparison.OrdinalIgnoreCase) == true)
            .ToList();

        System.Diagnostics.Debug.WriteLine($"Rows matched for removal: {toRemove.Count}");

        foreach (var item in toRemove)
        {
            AccessList.Remove(item);
            _existingAccessList.RemoveAll(a => a.EmployeeId == item.EmployeeId);
        }

        _teamCheckboxAddedIds.Clear();
    });
}



if (atLeastOnePresent)
{
    _teamCheckboxAddedIds.Clear();

    foreach (var al in loadedListArray)
    {
        System.Diagnostics.Debug.WriteLine($"Checking al - EmployeeId: '{al.EmployeeId}', inValidSet: {al.EmployeeId != null && validTeamMemberIds.Contains(al.EmployeeId)}, VisibilityRule: '{al.VisibilityRule}'");
        
        if (al.EmployeeId != null &&
            validTeamMemberIds.Contains(al.EmployeeId) &&
            al.VisibilityRule?.Trim().Equals(
                "Manually Added", StringComparison.OrdinalIgnoreCase) == true)
        {
            _teamCheckboxAddedIds.Add(al.EmployeeId);
            System.Diagnostics.Debug.WriteLine($"  --> Added to tracking: '{al.EmployeeId}'");
        }
    }

    System.Diagnostics.Debug.WriteLine($"After InferCheckboxState - tracking set count: {_teamCheckboxAddedIds.Count}");
          }








import { vi, expect as vitestExpect } from 'vitest';

const exp = vitestExpect as any;

(globalThis as any).jasmine = {
  createSpy: (name?: string) => vi.fn(),
  createSpyObj: (_name: string, methods: string[]) => {
    const obj: any = {};
    methods.forEach((m) => (obj[m] = vi.fn()));
    return obj;
  },
  objectContaining: (sample: object) => exp.objectContaining(sample),
  arrayContaining: (sample: unknown[]) => exp.arrayContaining(sample),
  stringMatching: (pattern: string | RegExp) => exp.stringMatching(pattern),
  any: (constructor: any) => exp.any(constructor),
};




Create a new file src/jasmine-shim.ts:
import { vi } from 'vitest';

// Shim jasmine globals so existing specs don't need to be rewritten
(globalThis as any).jasmine = {
  createSpy: (name?: string) => vi.fn(),
  createSpyObj: (name: string, methods: string[]) => {
    const obj: any = {};
    methods.forEach((m) => (obj[m] = vi.fn()));
    return obj;
  },
  objectContaining: (sample: object) => expect.objectContaining(sample),
  arrayContaining: (sample: unknown[]) => expect.arrayContaining(sample),
  stringMatching: (pattern: string | RegExp) => expect.stringMatching(pattern),
  any: (constructor: any) => expect.any(constructor),
};




import { defineConfig } from 'vitest/config';
import { angular } from '@analogjs/vitest-angular/plugin';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
Remove the esbuild block — the angular() plugin handles decorator transforms internally.
src/test-setup.ts — add zone.js imports
import 'zone.js';
import 'zone.js/testing';
import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);







Create vitest.config.ts in project root
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
  esbuild: {
    // Needed for Angular decorators
    target: 'es2022',
  },
});
Step 3 — Create src/test-setup.ts
import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// Initialize the Angular testing environment once
TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);




public ClientCoverageEqdWidgetViewModel(IDialogService dialogSerivce, 
    IClientsService clientService, 
    IClientsDialogService clientsDialogService, 
    List<ClientCoverage> clientCoverages = null)
    : base(dialogSerivce, clientCoverages)
{
    _clientService = clientService;
    _clientsDialogService = clientsDialogService;
    
    // Fixed: Button enabled when ClientID is NOT empty
    var canExecute = this.WhenAnyValue(x => x.ClientID, 
        id => !string.IsNullOrWhiteSpace(id));
    
    OpenCoverageCommand = ReactiveCommand.Create(OpenCoverageInBrowser, canExecute);
    
    // Debug: Log when ClientID changes
    this.WhenAnyValue(x => x.ClientID)
        .Subscribe(id => Trace.WriteLine($"[DEBUG] ClientID changed to: '{id}'"));
}

private void OpenCoverageInBrowser()
{
    Trace.WriteLine("[OpenCoverageCommand] INFO command invoked.");
    
    string clientId = this.ClientID;
    Trace.WriteLine($"[OpenCoverageCommand] INFO - ClientID = '{clientId}'");
    
    if (string.IsNullOrWhiteSpace(clientId))
    {
        Trace.WriteLine("[OpenCoverageCommand] WARN ClientID is empty (should not happen).");
        return;
    }
    
    // Fix your URL format here - this is probably why nothing happens
    string url = $"http://your-actual-domain/crs-page?ViewType=ShowClientCoverage&ContextualObjectId={clientId}";
    Trace.WriteLine($"[OpenCoverageCommand] INFO Final URL = {url}");
    
    try
    {
        Process.Start(new ProcessStartInfo
        {
            FileName = url,
            UseShellExecute = true
        });
        Trace.WriteLine("[OpenCoverageCommand] INFO Browser launched successfully.");
    }
    catch (Exception ex)
    {
        Trace.WriteLine($"[OpenCoverageCommand] ERROR - Browser launch failed: {ex}");
        // Also show to user
        MessageBox.Show($"Failed to open coverage page: {ex.Message}", "Error", 
            MessageBoxButton.OK, MessageBoxImage.Error);
    }
}
