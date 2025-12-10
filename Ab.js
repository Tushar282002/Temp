public class ProductsFieldManager : InteractionFieldManagerBase
{
    private readonly IUserAuthenticationService _userAuthenticationService;
    private readonly IPermissionService _permissionService;

    public ProductsFieldManager(
        IUserAuthenticationService userAuthenticationService,
        IPermissionService permissionService)
    {
        if (userAuthenticationService == null)
        {
            throw new ArgumentNullException(nameof(userAuthenticationService));
        }
        if (permissionService == null)
        {
            throw new ArgumentNullException(nameof(permissionService));
        }
        _userAuthenticationService = userAuthenticationService;
        _permissionService = permissionService;
    }

    public override void InitializeInteraction(InteractionModel interaction)
    {
        if (!interaction.IsNew())
        {
            return;
        }
        
        interaction.DeskProducts = new List<Product>();
        
        if (_permissionService.ActiveBusinessArea.IsEqdBusinessArea())
        {
            if (_userAuthenticationService.Context.Products != null)
            {
                foreach (var product in _userAuthenticationService.Context.Products)
                {
                    interaction.DeskProducts.Add(product);
                }
            }
        }
        else
        {
            if (_userAuthenticationService.Context.PrimaryProduct != null)
            {
                interaction.DeskProducts.Add(_userAuthenticationService.Context.PrimaryProduct);
            }
        }
    }

    public override void LoadVMState(InteractionModel interaction, InteractionEditViewModel vm)
    {
        if (vm.ProductSelectionViewModel != null)
        {
            vm.ProductSelectionViewModel.SelectedProducts = (interaction.DeskProducts != null)
                ? new ObservableCollection<Product>(interaction.DeskProducts)
                : new ObservableCollection<Product>();
            
            Task.Run(() => vm.ProductSelectionViewModel.LoadProducts(ProductSearchType.InteractionProducts));
        }
    }

    public override void SaveVMState(InteractionEditViewModel vm, InteractionModel interaction)
    {
        if (vm.ProductSelectionViewModel != null)
        {
            interaction.DeskProducts = vm.ProductSelectionViewModel.SelectedProducts != null 
                ? vm.ProductSelectionViewModel.SelectedProducts.ToList()
                : new List<Product>();
        }
    }

    public override void SetupVMPropertyRelations(InteractionEditViewModel vm)
    {
        // When CanEdit is set to true, ProductSelectionViewModel should load itself
        RegisterForDispose(
            vm.WhenAny(x => x.CanEdit, x => x.Value)
                .Where(canEdit => canEdit)
                .Subscribe(_ => vm.ProductSelectionViewModel.LoadProducts())
        );
    }

    public override void SetupVMValidationTriggers(InteractionEditViewModel vm)
    {
        // Validate Products on products change (only when invalid), also on privacy level change (as that may change validity of products)
        var productsChanged = vm.WhenAny(
            x => x.ProductSelectionViewModel.SelectedProducts,
            x => x.Value)
            .Select(_ => Unit.Default);

        var privacyLevelChanged = vm.WhenAny(
            x => x.PrivacyLevel,
            x => x.Value)
            .Select(_ => Unit.Default);

        // For RM business area, also watch theme changes
        var themesChanged = vm.WhenAny(
            x => x.SelectedThemes,
            x => x.Value)
            .Select(_ => Unit.Default);

        RegisterForDispose(
            productsChanged
                .Merge(privacyLevelChanged)
                .Merge(themesChanged)
                .Where(_ => vm.GetErrors("ProductSelectionViewModel").Cast<object>().Any())
                .Subscribe(_ => ValidateVM(vm))
        );
    }

    public override void ValidateVM(InteractionEditViewModel vm)
    {
        if (!vm.CanEdit)
        {
            return;
        }

        vm.RemoveError("SelectedProducts");
        vm.RemoveError("ProductSelectionViewModel");
        vm.RemoveError("ProductSelectionControlModel");
        vm.ProductSelectionViewModel?.RemoveError("SelectedProducts");
        vm.ProductSelectionViewModel?.RemoveError("ProductSelectionViewModel");
        vm.ProductSelectionViewModel?.RemoveError("ProductSelectionControlModel");

        if (_permissionService.UseInteractionNewDesign && !vm.IsThemeOrProductMandatory)
        {
            return;
        }

        var isWithoutProduct = vm.ProductSelectionViewModel != null &&
            (vm.ProductSelectionViewModel.SelectedProducts == null || 
             !vm.ProductSelectionViewModel.SelectedProducts.Any());

        var isPrivilegedOrSensitive = vm.PrivacyLevel != null &&
            (vm.PrivacyLevel.PrivacyFlag == PrivacyLevels.Privileged || 
             vm.PrivacyLevel.PrivacyFlag == PrivacyLevels.Sensitive);

        // NEW: For RM business area, check Theme OR Product validation
        if (_permissionService.ActiveBusinessArea.IsRmBusinessArea() && vm.IsThemeOrProductMandatory)
        {
            var isWithoutTheme = vm.ThemesViewModel != null &&
                (vm.ThemesViewModel.SelectedItems == null || 
                 !vm.ThemesViewModel.SelectedItems.Any());

            if (isWithoutProduct && isWithoutTheme)
            {
                const string errorMessage = "Please select a Theme or a Product";
                vm.AddError("ProductSelectionViewModel", errorMessage);
                vm.ProductSelectionViewModel.AddError("SelectedProducts", errorMessage);
            }
        }
        // EXISTING: Original validation logic (unchanged)
        else if (isWithoutProduct && (vm.IsProductsMandatory || isPrivilegedOrSensitive))
        {
            const string errorMessage = "This is a required field, please enter at least one product";
            vm.AddError("ProductSelectionViewModel", errorMessage);
            vm.ProductSelectionViewModel.AddError("SelectedProducts", errorMessage);
        }
    }
    }
