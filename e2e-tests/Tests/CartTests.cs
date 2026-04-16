using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Pages;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

/// <summary>
/// Tests for the /cart page.
///
/// Split into two logical groups:
///   • EmptyCart — direct navigation, no prior add-to-cart action.
///   • WithItem  — uses the full UI flow (Catalog → Product → Add to Cart → Cart)
///                 to reach a non-empty cart state before asserting.
/// </summary>
[TestFixture]
public class CartTests : BaseTest
{
    private CartPage _cartPage = null!;

    [SetUp]
    public async Task SetUp()
    {
        _cartPage = new CartPage(Page);
        await _cartPage.NavigateAsync();
    }

    // ════════════════════════════════════════════════════════════════════════════
    // Empty cart state
    // ════════════════════════════════════════════════════════════════════════════

    [Test]
    public async Task CartPage_ShouldDisplayHeader()
    {
        var isVisible = await _cartPage.Header.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task CartPage_ShouldDisplayFooter()
    {
        var isVisible = await _cartPage.Footer.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task CartPage_EmptyCart_ShouldDisplayEmptyMessage()
    {
        var isVisible = await _cartPage.IsEmptyCartVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task CartPage_EmptyCart_ShouldDisplayRecoveryLinks()
    {
        Assert.Multiple(async () =>
        {
            Assert.That(await _cartPage.IsBrowseGamesLinkVisibleAsync(), Is.True);
            Assert.That(await _cartPage.IsBackToHomeLinkVisibleAsync(), Is.True);
        });
    }

    [Test]
    public async Task CartPage_EmptyCart_BrowseGamesLink_ShouldNavigateToCatalog()
    {
        await _cartPage.ClickBrowseGamesAsync();
        await Page.WaitForURLAsync("**/games");
        Assert.That(Page.Url, Does.Contain("/games"));
    }

    [Test]
    public async Task CartPage_EmptyCart_BackToHomeLink_ShouldNavigateHome()
    {
        await _cartPage.ClickBackToHomeAsync();
        await Page.WaitForURLAsync(url => !url.Contains("/cart"));
        Assert.That(Page.Url.TrimEnd('/'), Is.EqualTo(TestSettings.BaseUrl.TrimEnd('/')));
    }

    // ════════════════════════════════════════════════════════════════════════════
    // Cart with items  (full UI add-to-cart flow)
    // ════════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Navigates to the catalog, clicks the first game, adds it to the cart via
    /// the product page, then navigates to /cart — leaving the browser on the
    /// cart page and ready for assertions.
    /// </summary>
    private async Task AddFirstGameToCartAndOpenCartPageAsync()
    {
        var catalogPage = new CatalogPage(Page);
        await catalogPage.NavigateAsync();

        // Guard: if no game links rendered, the backend is unavailable — skip gracefully
        var firstGameLink = Page.Locator("a[href*='/games/']").First;
        var href = await firstGameLink.GetAttributeAsync("href", new LocatorGetAttributeOptions { Timeout = 5_000 });
        if (string.IsNullOrEmpty(href))
        {
            Assert.Ignore("No game cards found in catalog — backend may be unavailable.");
            return;
        }

        // Navigate directly to the product page to avoid overlay/click issues
        await Page.GotoAsync($"{TestSettings.BaseUrl}{href}");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Click the "Add to Cart" button and wait for the "Added!" confirmation label
        var addToCartButton = Page.Locator("button:has-text('Add to Cart')").First;
        await addToCartButton.ClickAsync();
        await Page.Locator("button:has-text('Added!')").WaitForAsync(new() { Timeout = 5_000 });

        // Now navigate to the cart page
        await Page.GotoAsync($"{TestSettings.BaseUrl}/cart");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);
    }

    [Test]
    public async Task CartPage_WithItem_ShouldDisplayCartHeading()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();
        var heading = await _cartPage.GetCartHeadingTextAsync();
        Assert.That(heading, Does.Contain("Shopping Cart").IgnoreCase);
    }

    [Test]
    public async Task CartPage_WithItem_ShouldHaveAtLeastOneCartRow()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();
        var count = await _cartPage.GetCartItemCountAsync();
        Assert.That(count, Is.GreaterThanOrEqualTo(1));
    }

    [Test]
    public async Task CartPage_WithItem_ShouldDisplayOrderSummary()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();
        var isVisible = await _cartPage.IsOrderSummaryVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task CartPage_WithItem_ShouldDisplayCheckoutButton()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();
        var isVisible = await _cartPage.IsCheckoutButtonVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task CartPage_WithItem_ShouldDisplayClearCartButton()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();
        var isVisible = await _cartPage.IsClearCartButtonVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task CartPage_WithItem_ShouldDisplayCompleteOrderSection()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();
        var isVisible = await _cartPage.IsCompleteOrderSectionVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task CartPage_WithItem_IncreaseQuantity_ShouldUpdateCount()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();

        // Read the qty display before increasing
        var qtySpan = Page.Locator("button[aria-label^='Decrease quantity'] ~ span").First;
        var before = await qtySpan.InnerTextAsync();

        await _cartPage.ClickIncreaseQuantityAsync();
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var after = await qtySpan.InnerTextAsync();
        Assert.That(int.Parse(after.Trim()), Is.GreaterThan(int.Parse(before.Trim())));
    }

    [Test]
    public async Task CartPage_WithItem_RemoveItem_ShouldShowEmptyState()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();
        await _cartPage.ClickRemoveItemAsync();
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var isEmptyVisible = await _cartPage.IsEmptyCartVisibleAsync();
        Assert.That(isEmptyVisible, Is.True);
    }

    [Test]
    public async Task CartPage_WithItem_ClearCart_ShouldShowEmptyState()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();
        await _cartPage.ClickClearCartAsync();
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var isEmptyVisible = await _cartPage.IsEmptyCartVisibleAsync();
        Assert.That(isEmptyVisible, Is.True);
    }
}
