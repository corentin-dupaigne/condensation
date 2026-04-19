using Microsoft.Playwright;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Pages;

public class SearchPage : BasePage
{
    protected override string PagePath => "/search";

    // Search hero (page-level, not the header search bar)
    private ILocator SearchInput => Page.Locator("section form input[type='search']");
    private ILocator SearchButton => Page.Locator("section form button[type='submit']:has-text('Search')");
    private ILocator ResultCount => Page.Locator("span:has-text('Retrieved'), p:has-text('result')").First;

    // Results — GameCard renders as <a href="/games/{id}">
    private ILocator ResultCards => Page.Locator("main a[href*='/games/']");
    private ILocator NoResultsMessage => Page.Locator("text=No results found");

    // Popular searches — <Link> pills inside the Popular Searches section
    private ILocator PopularSearchPills => Page.Locator("section:has(h2:has-text('Popular Searches')) a[href*='/search']");

    // Filters
    private ILocator ClearAllButton => Page.Locator("button:has-text('Clear All')");

    public SearchPage(IPage page) : base(page) { }

    public async Task NavigateWithQueryAsync(string query)
    {
        await Page.GotoAsync(
            $"{BaseUrl}/search?q={Uri.EscapeDataString(query)}",
            new PageGotoOptions { WaitUntil = WaitUntilState.DOMContentLoaded }
        );
    }

    public async Task SearchAsync(string query)
    {
        await SearchInput.FillAsync(query);
        await SearchButton.ClickAsync();
        await Page.WaitForURLAsync(
            url => url.Contains("/search?q="),
            new() { WaitUntil = WaitUntilState.DOMContentLoaded }
        );
    }

    public async Task<int> GetResultCardCountAsync() => await ResultCards.CountAsync();

    public async Task ClickResultCardAsync(int index) => await ResultCards.Nth(index).ClickAsync();

    public async Task<bool> IsNoResultsVisibleAsync() => await NoResultsMessage.IsVisibleAsync();

    public async Task<int> GetPopularSearchCountAsync() => await PopularSearchPills.CountAsync();

    public async Task ClickPopularSearchAsync(int index) => await PopularSearchPills.Nth(index).ClickAsync();

    public async Task ClearAllFiltersAsync() => await ClearAllButton.ClickAsync();
}
