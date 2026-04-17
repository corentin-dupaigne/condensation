using Microsoft.Playwright;

namespace Condensation.E2E.Tests.Pages;

public class CatalogPage : BasePage
{
    protected override string PagePath => "/games";

    // Filters
    private ILocator FilterSidebar => Page.Locator("aside, [class*='filter'], [class*='sidebar']").First;
    private ILocator ClearAllFiltersButton => Page.Locator("button:has-text('Clear All'), button:has-text('Clear all')");

    // Sort & View
    private ILocator SortDropdown => Page.Locator("select, button:has-text('Sort'), [class*='sort']").First;
    private ILocator GridViewButton => Page.Locator("button[aria-label*='grid' i], button[aria-label*='Grid']");
    private ILocator ListViewButton => Page.Locator("button[aria-label*='list' i], button[aria-label*='List']");

    // Game cards — GameCard renders as <a href="/games/{id}"> with Tailwind classes (no stable class name)
    private ILocator GameCards => Page.Locator("main a[href*='/games/']");
    private ILocator AddToCartButtons => Page.Locator("main a[href*='/games/'] button");

    // Pagination
    private ILocator NextPageButton => Page.Locator("button:has-text('Next'), [aria-label='Next']");
    private ILocator PreviousPageButton => Page.Locator("button:has-text('Previous'), [aria-label='Previous']");
    private ILocator PageButtons => Page.Locator("[class*='pagination'] button");

    public CatalogPage(IPage page) : base(page) { }

    public async Task<int> GetGameCardCountAsync() => await GameCards.CountAsync();

    public async Task ClickGameCardAsync(int index) =>
        await GameCards.Nth(index).ClickAsync(new LocatorClickOptions { Force = true });

    public async Task ClickAddToCartAsync(int index) => await AddToCartButtons.Nth(index).ClickAsync();

    public async Task ClickNextPageAsync() => await NextPageButton.ClickAsync();

    public async Task ClickPreviousPageAsync() => await PreviousPageButton.ClickAsync();

    public async Task ClearAllFiltersAsync() => await ClearAllFiltersButton.ClickAsync();

    public async Task SelectPlatformFilterAsync(string platform) =>
        await Page.Locator($"input[type='checkbox'][value='{platform}'], label:has-text('{platform}') input[type='checkbox']").First.CheckAsync();

    public async Task SelectGenreFilterAsync(string genre) =>
        await Page.Locator($"input[type='checkbox'][value='{genre}'], label:has-text('{genre}') input[type='checkbox']").First.CheckAsync();

    public async Task<bool> IsFilterSidebarVisibleAsync() => await FilterSidebar.IsVisibleAsync();
}
