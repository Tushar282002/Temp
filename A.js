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
