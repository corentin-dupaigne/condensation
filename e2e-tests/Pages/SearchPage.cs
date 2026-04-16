using Microsoft.Playwright;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Pages;

public class SearchPage : BasePage
{
    protected override string PagePath => "/search";

    // Search hero
    private ILocator SearchInput => Page.Locator("input[type='text'], input[placeholder*='search' i]").Last;
    private ILocator SearchButton => Page.Locator("button:has-text('Search')");
    private ILocator ResultCount => Page.Locator("[class*='result'] p, p:has-text('result')").First;

    // Results
    private ILocator ResultCards => Page.Locator("[class*='game'], [class*='card']");
    private ILocator NoResultsMessage => Page.Locator("text=No results found");

    // Popular searches
    private ILocator PopularSearchPills => Page.Locator("[class*='popular'] a, [class*='popular'] button");

    // Filters
    private ILocator ClearAllButton => Page.Locator("button:has-text('Clear All')");

    public SearchPage(IPage page) : base(page) { }

    public async Task NavigateWithQueryAsync(string query)
    {
        await Page.GotoAsync($"{BaseUrl}/search?q={Uri.EscapeDataString(query)}");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);
    }

    public async Task SearchAsync(string query)
    {
        await SearchInput.FillAsync(query);
        await SearchInput.PressAsync("Enter");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);
    }

    public async Task<int> GetResultCardCountAsync() => await ResultCards.CountAsync();

    public async Task ClickResultCardAsync(int index) => await ResultCards.Nth(index).ClickAsync();

    public async Task<bool> IsNoResultsVisibleAsync() => await NoResultsMessage.IsVisibleAsync();

    public async Task<int> GetPopularSearchCountAsync() => await PopularSearchPills.CountAsync();

    public async Task ClickPopularSearchAsync(int index) => await PopularSearchPills.Nth(index).ClickAsync();

    public async Task ClearAllFiltersAsync() => await ClearAllButton.ClickAsync();
}
