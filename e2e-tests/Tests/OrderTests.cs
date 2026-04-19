using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Pages;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

/// <summary>
/// Tests for the /orders page (requires authentication).
/// Verifies heading, layout, and navigation. Handles both empty and populated states.
/// </summary>
[TestFixture]
public class OrderTests : AuthenticatedBaseTest
{
    [SetUp]
    public async Task SetUp()
    {
        await GoToAsync($"{TestSettings.BaseUrl}/orders");
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
    }

    // ── Page structure ──────────────────────────────────────────────────────────

    [Test]
    public async Task OrdersPage_ShouldDisplayHeading()
    {
        var heading = Page.Locator("h1:has-text('Your Orders')");
        await Expect(heading).ToBeVisibleAsync();
    }

    [Test]
    public async Task OrdersPage_ShouldDisplayHeader()
    {
        var homePage = new HomePage(Page);
        var isVisible = await homePage.Header.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task OrdersPage_ShouldDisplayBrowseGamesLink()
    {
        // "Browse more games" or "Browse games" depending on empty/populated state
        var browseLink = Page.Locator("a[href='/games'], a[href*='/games']:has-text('Browse')").First;
        await Expect(browseLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task OrdersPage_EmptyOrPopulated_ShouldRenderWithoutError()
    {
        // Either the empty state message or order rows should be visible
        var emptyMessage = Page.Locator("text=no orders");
        var orderRow = Page.Locator("text=/^#\\d+/").First;

        var hasEmpty = await emptyMessage.IsVisibleAsync();
        var hasOrders = await orderRow.IsVisibleAsync();

        Assert.That(hasEmpty || hasOrders, Is.True, "Neither empty state nor order rows are visible");
    }

    // ── Navigation ──────────────────────────────────────────────────────────────

    [Test]
    public async Task OrdersPage_ShouldBeAccessibleFromUserMenu()
    {
        await GoToAsync(TestSettings.BaseUrl);
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        await Page.Locator("button[aria-label='User menu']").ClickAsync();
        await Page.Locator("header a[href='/orders']").ClickAsync();
        await Page.WaitForURLAsync("**/orders", new() { WaitUntil = WaitUntilState.DOMContentLoaded });

        Assert.That(Page.Url, Does.Contain("/orders"));
    }

    [Test]
    public async Task OrdersPage_BrowseGamesLink_ShouldNavigateToCatalog()
    {
        var browseLink = Page.Locator("a[href='/games'], a[href*='/games']:has-text('Browse')").First;
        await browseLink.ClickAsync();
        await Page.WaitForURLAsync("**/games", new() { WaitUntil = WaitUntilState.DOMContentLoaded });

        Assert.That(Page.Url, Does.Contain("/games"));
    }
}
