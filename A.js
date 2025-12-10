[InteractionFieldManagerMetadata(Order = 19)]
public class ThemesFieldManager : InteractionFieldManagerBase
{
    #region Private Declarations

    private readonly IPermissionService _permissionService;

    #endregion

    #region Constructor
    public ThemesFieldManager(IPermissionService permissionService)
    {
        _permissionService = permissionService ?? throw new ArgumentNullException(nameof(permissionService));
    }
    #endregion

    #region Public Override Methods

    public override void LoadVMState(InteractionModel interaction, InteractionEditViewModel vm)
    {
        if (_permissionService.ActiveBusinessArea.IsRmOrCmBusinessArea() && interaction.IsNew())
        {
            vm.SelectedThemes = new List<string>();
        }
        else
        {
            vm.SelectedThemes = interaction.Themes ?? new List<string>();
        }
    }

    public override void SetupVMValidationTriggers(InteractionEditViewModel vm)
    {
        // Watch for changes in ThemesViewModel.SelectedItems
        IObservable<Unit> themesViewModelChanged = null;
        if (vm.ThemesViewModel != null)
        {
            themesViewModelChanged = vm.WhenAny(
                x => x.ThemesViewModel.SelectedItems,
                x => x.Value)
                .Select(_ => Unit.Default);
        }

        // Watch for changes in SelectedThemes
        var selectedThemesChanged = vm.WhenAny(
            x => x.SelectedThemes,
            x => x.Value)
            .Select(_ => Unit.Default);

        // Watch for changes in Products (since either Theme OR Product satisfies the requirement)
        IObservable<Unit> productsChanged = null;
        if (vm.ProductSelectionViewModel != null)
        {
            productsChanged = vm.WhenAny(
                x => x.ProductSelectionViewModel.SelectedProducts,
                x => x.Value)
                .Select(_ => Unit.Default);
        }

        // Combine all change observables
        var allChanges = new List<IObservable<Unit>>();
        
        if (themesViewModelChanged != null)
            allChanges.Add(themesViewModelChanged);
        
        allChanges.Add(selectedThemesChanged);
        
        if (productsChanged != null)
            allChanges.Add(productsChanged);

        var combinedChanges = allChanges.Count > 1 
            ? allChanges.Aggregate((a, b) => a.Merge(b))
            : allChanges.First();

        // Subscribe to changes and validate
        RegisterForDispose(
            combinedChanges
                .Throttle(TimeSpan.FromMilliseconds(50))
                .ObserveOn(RxApp.MainThreadScheduler)
                .Subscribe(_ => ValidateVM(vm))
        );
    }

    public override void ValidateVM(InteractionEditViewModel vm)
    {
        if (!vm.CanEdit)
        {
            return;
        }

        // Clear existing errors first
        vm.RemoveError("ThemesViewModel");
        vm.RemoveError("SelectedThemes");
        if (vm.ThemesViewModel != null)
        {
            vm.ThemesViewModel.RemoveError("SelectedThemes");
            vm.ThemesViewModel.RemoveError("ThemesViewModel");
        }

        // Check if theme is selected
        var hasTheme = vm.ThemesViewModel != null && 
                       vm.ThemesViewModel.SelectedItems != null && 
                       vm.ThemesViewModel.SelectedItems.Any();

        // Check if product is selected
        var hasProduct = vm.ProductSelectionViewModel != null && 
                         vm.ProductSelectionViewModel.SelectedProducts != null && 
                         vm.ProductSelectionViewModel.SelectedProducts.Any();

        // Only show error if BOTH theme and product are missing AND it's mandatory
        if (!hasTheme && !hasProduct && vm.IsThemeOrProductMandatory)
        {
            const string errorMessage = "Please select a Theme or a Product";
            vm.AddError("ThemesViewModel", errorMessage);
            if (vm.ThemesViewModel != null)
            {
                vm.ThemesViewModel.AddError("SelectedThemes", errorMessage);
            }
        }
    }

    public override void SaveVMState(InteractionEditViewModel vm, InteractionModel interaction)
    {
        vm.RefreshSelectedThemes();
        interaction.Themes = vm.SelectedThemes;
        
        if (interaction.AttendeeTypes == null)
        {
            interaction.AttendeeTypes = new List<string>();
        }
        
        interaction.AttendeeTypes = interaction.GetAllAttendeeTypes(_permissionService.ActiveBusinessArea);
    }

    #endregion
}
