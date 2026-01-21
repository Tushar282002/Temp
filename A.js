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
