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
        await Expect(_cartPage.EmptyCartMessage).ToBeVisibleAsync();
    }

    [Test]
    public async Task CartPage_EmptyCart_ShouldDisplayRecoveryLinks()
    {
        await Expect(_cartPage.BrowseGamesLink).ToBeVisibleAsync();
        await Expect(_cartPage.BackToHomeLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task CartPage_EmptyCart_BrowseGamesLink_ShouldNavigateToCatalog()
    {
        await _cartPage.ClickBrowseGamesAsync();
        await Page.WaitForURLAsync("**/games", new() { WaitUntil = WaitUntilState.DOMContentLoaded });
        Assert.That(Page.Url, Does.Contain("/games"));
    }

    [Test]
    public async Task CartPage_EmptyCart_BackToHomeLink_ShouldNavigateHome()
    {
        await _cartPage.ClickBackToHomeAsync();
        await Page.WaitForURLAsync(url => !url.Contains("/cart"), new() { WaitUntil = WaitUntilState.DOMContentLoaded });
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

        var firstGameLink = Page.Locator("main a[href*='/games/']").First;
        var href = await firstGameLink.GetAttributeAsync("href");

        await GoToAsync($"{TestSettings.BaseUrl}{href}");

        await Page.Locator("button:has-text('Add to Cart')").First.ClickAsync();
        await Expect(Page.Locator("button:has-text('Added!')")).ToBeVisibleAsync();

        await GoToAsync($"{TestSettings.BaseUrl}/cart");
        await Expect(_cartPage.CartHeading).ToBeVisibleAsync();
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
        await Expect(_cartPage.OrderSummaryHeading).ToBeVisibleAsync();
    }

    [Test]
    public async Task CartPage_WithItem_ShouldDisplayCheckoutButton()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();
        await Expect(_cartPage.CheckoutButton).ToBeVisibleAsync();
    }

    [Test]
    public async Task CartPage_WithItem_ShouldDisplayClearCartButton()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();
        await Expect(_cartPage.ClearCartButton).ToBeVisibleAsync();
    }

    [Test]
    public async Task CartPage_WithItem_ShouldDisplayCompleteOrderSection()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();
        await Expect(_cartPage.CompleteOrderHeading).ToBeVisibleAsync();
    }

    [Test]
    public async Task CartPage_WithItem_IncreaseQuantity_ShouldUpdateCount()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();

        var qtySpan = Page.Locator("button[aria-label^='Decrease quantity'] ~ span").First;
        var before = int.Parse((await qtySpan.InnerTextAsync()).Trim());

        await _cartPage.ClickIncreaseQuantityAsync();
        await Expect(qtySpan).ToHaveTextAsync((before + 1).ToString());
    }

    [Test]
    public async Task CartPage_WithItem_RemoveItem_ShouldShowEmptyState()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();
        await _cartPage.ClickRemoveItemAsync();
        await Expect(_cartPage.EmptyCartMessage).ToBeVisibleAsync();
    }

    [Test]
    public async Task CartPage_WithItem_ClearCart_ShouldShowEmptyState()
    {
        await AddFirstGameToCartAndOpenCartPageAsync();
        await _cartPage.ClickClearCartAsync();
        await Expect(_cartPage.EmptyCartMessage).ToBeVisibleAsync();
    }
}
