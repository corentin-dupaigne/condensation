using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Pages;

namespace Condensation.E2E.Tests.Tests;

[TestFixture]
public class CatalogTests : BaseTest
{
    private CatalogPage _catalogPage = null!;

    [SetUp]
    public async Task SetUp()
    {
        _catalogPage = new CatalogPage(Page);
        await _catalogPage.NavigateAsync();
    }

    [Test]
    public async Task CatalogPage_ShouldLoadSuccessfully()
    {
        var title = await _catalogPage.GetTitleAsync();
        Assert.That(title, Does.Contain("Catalog"));
    }

    [Test]
    public async Task CatalogPage_ShouldDisplayHeader()
    {
        var isVisible = await _catalogPage.Header.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task CatalogPage_ShouldDisplayFooter()
    {
        var isVisible = await _catalogPage.Footer.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task CatalogPage_ShouldDisplayGameCards()
    {
        var count = await _catalogPage.GetGameCardCountAsync();
        Assert.That(count, Is.GreaterThan(0));
    }

    [Test]
    public async Task CatalogPage_ShouldNavigateToProductOnCardClick()
    {
        var initialUrl = Page.Url;
        await _catalogPage.ClickGameCardAsync(0);
        await Page.WaitForURLAsync("**/games/**", new() { WaitUntil = WaitUntilState.DOMContentLoaded });
        Assert.That(Page.Url, Is.Not.EqualTo(initialUrl));
    }

    // ── Filter sidebar ────────────────────────────────────────────────────────

    [Test]
    public async Task CatalogPage_ShouldDisplayFilterSidebar()
    {
        var isVisible = await _catalogPage.IsFilterSidebarVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task CatalogPage_GenreFilter_ShouldHaveCheckboxes()
    {
        // FilterGroup renders hidden <input type="checkbox" class="sr-only"> per genre option
        var checkboxes = Page.Locator("aside input[type='checkbox']");
        var count = await checkboxes.CountAsync();
        Assert.That(count, Is.GreaterThan(0));
    }

    [Test]
    public async Task CatalogPage_GenreFilter_ClickLabel_ShouldToggleSelection()
    {
        // Click the first visible genre label; the custom checkbox should become checked
        var firstLabel = Page.Locator("aside label").First;
        await Expect(firstLabel).ToBeVisibleAsync();
        var firstCheckbox = firstLabel.Locator("input[type='checkbox']");

        var checkedBefore = await firstCheckbox.IsCheckedAsync();
        await firstLabel.ClickAsync(new Microsoft.Playwright.LocatorClickOptions { Force = true });
        var checkedAfter = await firstCheckbox.IsCheckedAsync();

        Assert.That(checkedAfter, Is.Not.EqualTo(checkedBefore));
    }

    // ── Sort dropdown ─────────────────────────────────────────────────────────

    [Test]
    public async Task CatalogPage_SortDropdown_ShouldBeVisible()
    {
        // SortDropdown renders a button showing the current sort label (default: "Bestselling")
        var sortButton = Page.Locator("button:has-text('Bestselling')");
        await Expect(sortButton).ToBeVisibleAsync();
    }

    [Test]
    public async Task CatalogPage_SortDropdown_Click_ShouldOpenOptions()
    {
        var sortButton = Page.Locator("button:has-text('Bestselling')");
        await Expect(sortButton).ToBeVisibleAsync();
        await sortButton.ClickAsync();

        // Options appear in a popup — "Price: Low to High" is one of them
        var option = Page.Locator("button:has-text('Price: Low to High')");
        await Expect(option).ToBeVisibleAsync();
    }

    [Test]
    public async Task CatalogPage_SortDropdown_SelectOption_ShouldUpdateLabel()
    {
        var sortButton = Page.Locator("button:has-text('Bestselling')");
        await Expect(sortButton).ToBeVisibleAsync();
        await sortButton.ClickAsync();

        await Page.Locator("button:has-text('Newest Arrivals')").ClickAsync();
        await Page.WaitForLoadStateAsync(Microsoft.Playwright.LoadState.DOMContentLoaded);

        // The trigger button now shows the selected label
        var updatedButton = Page.Locator("button:has-text('Newest Arrivals')").First;
        await Expect(updatedButton).ToBeVisibleAsync();
    }

    // ── Game cards ────────────────────────────────────────────────────────────

    [Test]
    public async Task CatalogPage_GameCards_ShouldHaveLinksToProductPages()
    {
        var firstCardLink = Page.Locator("a[href*='/games/']").First;
        var href = await firstCardLink.GetAttributeAsync("href");
        Assert.That(href, Does.Match(@"/games/\d+"));
    }

    [Test]
    public async Task CatalogPage_ShouldDisplayAtLeastFourGameCards()
    {
        var count = await _catalogPage.GetGameCardCountAsync();
        Assert.That(count, Is.GreaterThanOrEqualTo(4));
    }
}
