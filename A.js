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
        // Validate Themes on themes change (only when invalid)
        var themesChanged = Observable.FromEventPattern(
            h => vm.ThemesChanged += h, 
            h => vm.ThemesChanged -= h)
            .Select(_ => Unit.Default);

        RegisterForDispose(
            themesChanged
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

        // Clear existing errors
        vm.RemoveError("ThemesViewModel");
        vm.RemoveError("SelectedThemes");
        vm.ThemesViewModel?.RemoveError("SelectedThemes");
        vm.ThemesViewModel?.RemoveError("ThemesViewModel");

        var isWithoutTheme = vm.ThemesViewModel != null && 
            (vm.ThemesViewModel.SelectedItems == null || !vm.ThemesViewModel.SelectedItems.Any());
        
        if (isWithoutTheme && vm.IsThemeOrProductMandatory)
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
