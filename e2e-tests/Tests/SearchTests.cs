using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Pages;

namespace Condensation.E2E.Tests.Tests;

[TestFixture]
public class SearchTests : BaseTest
{
    private SearchPage _searchPage = null!;

    [SetUp]
    public async Task SetUp()
    {
        _searchPage = new SearchPage(Page);
    }

    [Test]
    public async Task SearchPage_ShouldLoadSuccessfully()
    {
        await _searchPage.NavigateAsync();
        var title = await _searchPage.GetTitleAsync();
        Assert.That(title, Is.Not.Empty);
    }

    [Test]
    public async Task SearchPage_WithInvalidQuery_ShouldShowNoResults()
    {
        await _searchPage.NavigateWithQueryAsync("xyznonexistentgame12345");
        var isNoResults = await _searchPage.IsNoResultsVisibleAsync();
        Assert.That(isNoResults, Is.True);
    }

    [Test]
    public async Task SearchPage_ShouldDisplayHeader()
    {
        await _searchPage.NavigateAsync();
        var isVisible = await _searchPage.Header.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task SearchPage_ShouldDisplayFooter()
    {
        await _searchPage.NavigateAsync();
        var isVisible = await _searchPage.Footer.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    // ── Popular searches (skipped gracefully when none rendered) ───────────────

    [Test]
    public async Task SearchPage_PopularSearch_Click_ShouldNavigateWithQuery()
    {
        await _searchPage.NavigateAsync();

        var count = await _searchPage.GetPopularSearchCountAsync();
        if (count == 0)
            Assert.Inconclusive("No popular search pills rendered.");

        await _searchPage.ClickPopularSearchAsync(0);
        await Page.WaitForLoadStateAsync(Microsoft.Playwright.LoadState.DOMContentLoaded);

        Assert.That(Page.Url, Does.Contain("/search"));
    }

    // ── Search form ───────────────────────────────────────────────────────────

    [Test]
    public async Task SearchPage_SearchForm_Submit_ShouldUpdateUrlWithQuery()
    {
        await _searchPage.NavigateAsync();
        await _searchPage.SearchAsync("elden ring");

        Assert.Multiple(() =>
        {
            Assert.That(Page.Url, Does.Contain("/search"));
            Assert.That(Page.Url, Does.Contain("elden"));
        });
    }

    [Test]
    public async Task SearchPage_ResultCard_Click_ShouldNavigateToProductPage()
    {
        await _searchPage.NavigateWithQueryAsync("counter-strike");

        var count = await _searchPage.GetResultCardCountAsync();
        if (count == 0)
            Assert.Inconclusive("No result cards to click.");

        await _searchPage.ClickResultCardAsync(0);
        await Page.WaitForLoadStateAsync(Microsoft.Playwright.LoadState.DOMContentLoaded);

        Assert.That(Page.Url, Does.Contain("/games/"));
    }

    // ── Result count display ──────────────────────────────────────────────────

    [Test]
    public async Task SearchPage_WithQuery_ShouldDisplayResultCount()
    {
        await _searchPage.NavigateWithQueryAsync("counter-strike");

        // The SearchHero component renders "X Record(s) Retrieved"
        var resultCountText = Page.Locator("span:has-text('Retrieved'), p:has-text('result')").First;
        await Expect(resultCountText).ToBeVisibleAsync();
    }

    // ── URL and navigation ────────────────────────────────────────────────────

    [Test]
    public async Task SearchPage_ShouldHaveSearchInputVisible()
    {
        await _searchPage.NavigateAsync();
        var searchInput = Page.Locator("input[type='search'], input[placeholder*='search' i]").Last;
        await Expect(searchInput).ToBeVisibleAsync();
    }

    [Test]
    public async Task SearchPage_NavigateWithQuery_ShouldUpdateUrl()
    {
        await _searchPage.NavigateWithQueryAsync("halo");
        Assert.Multiple(() =>
        {
            Assert.That(Page.Url, Does.Contain("/search"));
            Assert.That(Page.Url, Does.Contain("halo"));
        });
    }
}
