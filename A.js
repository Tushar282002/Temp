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
