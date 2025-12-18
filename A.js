if (vm.ThemesViewModel != null && vm.ThemesViewModel.CustomTags != null)
    {
        // Deselect all tags first
        foreach (var tag in vm.ThemesViewModel.CustomTags)
        {
            tag.IsSelected = false;
        }
        
        // Then select only the ones that should be selected
        if (vm.SelectedThemes != null && vm.SelectedThemes.Any())
        {
            foreach (var themeName in vm.SelectedThemes)
            {
                var tag = vm.ThemesViewModel.CustomTags.FirstOrDefault(t => t.Name == themeName);
                if (tag != null)
                {
                    tag.IsSelected = true;
                }
            }
        }




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
        // Validate Themes on themes change (only when invalid), also on products change (as that may change validity of themes)
        
        var themesChanged = vm.WhenAny(
            x => x.SelectedThemes,
            x => x.Value)
            .Select(_ => Unit.Default);

        var productsChanged = vm.WhenAny(
            x => x.ProductSelectionViewModel.SelectedProducts,
            x => x.Value)
            .Select(_ => Unit.Default);

        RegisterForDispose(
            themesChanged
                .Merge(productsChanged)
                .Where(_ => vm.GetErrors("ThemesViewModel").Cast<object>().Any())
                .Subscribe(_ => ValidateVM(vm))
        );
    }

    public override void ValidateVM(InteractionEditViewModel vm)
    {
        if (!vm.CanEdit)
        {
            return;
        }

        // Clear all theme-related errors
        vm.RemoveError("SelectedThemes");
        vm.RemoveError("ThemesViewModel");
        vm.ThemesViewModel?.RemoveError("SelectedThemes");
        vm.ThemesViewModel?.RemoveError("ThemesViewModel");

        // Check if using new design where theme/product validation might be handled differently
        if (_permissionService.UseInteractionNewDesign && !vm.IsThemeOrProductMandatory)
        {
            return;
        }

        var isWithoutTheme = vm.ThemesViewModel != null && 
            (vm.ThemesViewModel.SelectedItems == null || !vm.ThemesViewModel.SelectedItems.Any());
        
        var isWithoutProduct = vm.ProductSelectionViewModel != null && 
            (vm.ProductSelectionViewModel.SelectedProducts == null || !vm.ProductSelectionViewModel.SelectedProducts.Any());

        // Only add error if BOTH theme and product are missing
        if (isWithoutTheme && isWithoutProduct && vm.IsThemeOrProductMandatory)
        {
            const string errorMessage = "Please select a Theme or a Product";
            vm.AddError("ThemesViewModel", errorMessage);
            vm.ThemesViewModel.AddError("SelectedThemes", errorMessage);
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
