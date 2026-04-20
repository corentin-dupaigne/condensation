using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Pages;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

/// <summary>
/// End-to-end user-journey tests that chain multiple pages in a single scenario,
/// simulating realistic navigation paths an actual visitor would take.
///
/// These tests do not add unit-level coverage — existing fixtures already do that.
/// Their purpose is to guarantee the critical paths stay wired together.
/// </summary>
[TestFixture]
public class UserJourneyTests : BaseTest
{
    // ════════════════════════════════════════════════════════════════════════════
    // Journey 1 — Anonymous visitor discovers the store via navigation
    // ════════════════════════════════════════════════════════════════════════════

    [Test]
    public async Task Journey_AnonymousVisitor_BrowsesCatalogAndOpensProduct()
    {
        var homePage = new HomePage(Page);
        await homePage.NavigateAsync();

        await Expect(Page.Locator("header")).ToBeVisibleAsync();
        Assert.That(await homePage.GetGameCardCountAsync(), Is.GreaterThan(0));

        await GoToAsync($"{TestSettings.BaseUrl}/games");
        await Page.WaitForURLAsync("**/games", new() { WaitUntil = WaitUntilState.DOMContentLoaded });

        var catalogCards = Page.Locator("main a[href*='/games/']");
        await Expect(catalogCards.First).ToBeVisibleAsync();

        var firstHref = await catalogCards.First.GetAttributeAsync("href");
        Assert.That(firstHref, Does.Contain("/games/"));

        await GoToAsync($"{TestSettings.BaseUrl}{firstHref}");
        await Expect(Page.Locator("h1").First).ToBeVisibleAsync();
        await Expect(Page.Locator("button:has-text('Add to Cart')")).ToBeVisibleAsync();
    }

    // ════════════════════════════════════════════════════════════════════════════
    // Journey 2 — Anonymous visitor searches a title, lands on product, adds to cart
    // ════════════════════════════════════════════════════════════════════════════

    [Test]
    public async Task Journey_AnonymousVisitor_SearchesAndAddsGameToCart()
    {
        // Seed-independent search: pull a real slug from the catalog first, then
        // search for a prefix of it so results are guaranteed.
        await GoToAsync($"{TestSettings.BaseUrl}/games");
        var catalogFirst = Page.Locator("main a[href*='/games/']").First;
        var catalogHref = await catalogFirst.GetAttributeAsync("href");
        var slug = catalogHref!.Split('/').Last();
        var searchTerm = slug.Split('-')[0];

        var homePage = new HomePage(Page);
        await homePage.NavigateAsync();

        var headerSearch = Page.Locator("header input[placeholder*='Search']");
        await headerSearch.ClickAsync();
        await headerSearch.FillAsync(searchTerm);
        await headerSearch.PressAsync("Enter");

        await Page.WaitForURLAsync(
            url => url.Contains("/search") && url.Contains(searchTerm),
            new() { WaitUntil = WaitUntilState.DOMContentLoaded }
        );

        var firstResult = Page.Locator("main a[href*='/games/']").First;
        await Expect(firstResult).ToBeVisibleAsync();
        var href = await firstResult.GetAttributeAsync("href");

        await GoToAsync($"{TestSettings.BaseUrl}{href}");
        await Expect(Page.Locator("h1").First).ToBeVisibleAsync();

        await Page.Locator("button:has-text('Add to Cart')").First.ClickAsync();
        await Expect(Page.Locator("button:has-text('Added!')")).ToBeVisibleAsync();

        await GoToAsync($"{TestSettings.BaseUrl}/cart");
        var cart = new CartPage(Page);
        await Expect(cart.CartHeading).ToBeVisibleAsync();
        Assert.That(await cart.GetCartItemCountAsync(), Is.GreaterThanOrEqualTo(1));
    }

    // ════════════════════════════════════════════════════════════════════════════
    // Journey 3 — Anonymous visitor adjusts cart quantity then removes item
    // ════════════════════════════════════════════════════════════════════════════

    [Test]
    public async Task Journey_AnonymousVisitor_ManagesCartQuantityThenEmptiesCart()
    {
        await AddFirstCatalogGameToCartAsync();
        await GoToAsync($"{TestSettings.BaseUrl}/cart");

        var cart = new CartPage(Page);
        await Expect(cart.CartHeading).ToBeVisibleAsync();
        Assert.That(await cart.GetCartItemCountAsync(), Is.GreaterThanOrEqualTo(1));

        var qtySpan = Page.Locator("button[aria-label^='Decrease quantity'] ~ span").First;
        var before = int.Parse((await qtySpan.InnerTextAsync()).Trim());
        await cart.ClickIncreaseQuantityAsync();
        await Expect(qtySpan).ToHaveTextAsync((before + 1).ToString());

        await cart.ClickClearCartAsync();
        await Expect(cart.EmptyCartMessage).ToBeVisibleAsync();
    }

    // ════════════════════════════════════════════════════════════════════════════
    // Helper
    // ════════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Navigates to the catalog, resolves the first game URL, opens it and
    /// clicks Add to Cart, asserting the "Added!" transient feedback.
    /// Leaves the browser on the product page.
    /// </summary>
    private async Task AddFirstCatalogGameToCartAsync()
    {
        await GoToAsync($"{TestSettings.BaseUrl}/games");

        var firstGameLink = Page.Locator("main a[href*='/games/']").First;
        var href = await firstGameLink.GetAttributeAsync("href");

        await GoToAsync($"{TestSettings.BaseUrl}{href}");
        await Page.Locator("button:has-text('Add to Cart')").First.ClickAsync();
        await Expect(Page.Locator("button:has-text('Added!')")).ToBeVisibleAsync();
    }
}

/// <summary>
/// Authenticated user-journey tests — chain login, purchase path up to the
/// payment modal, navigation through account pages, and logout.
/// </summary>
[TestFixture]
public class AuthenticatedUserJourneyTests : AuthenticatedBaseTest
{
    // ════════════════════════════════════════════════════════════════════════════
    // Journey 4 — Logged-in user buys a game up to the payment modal
    // ════════════════════════════════════════════════════════════════════════════

    [Test]
    public async Task Journey_LoggedInUser_AddsGameToCartAndReachesPaymentModal()
    {
        await GoToAsync($"{TestSettings.BaseUrl}/games");

        var firstGameLink = Page.Locator("main a[href*='/games/']").First;
        var href = await firstGameLink.GetAttributeAsync("href");

        await GoToAsync($"{TestSettings.BaseUrl}{href}");
        await Page.Locator("button:has-text('Add to Cart')").First.ClickAsync();
        await Expect(Page.Locator("button:has-text('Added!')")).ToBeVisibleAsync();

        await GoToAsync($"{TestSettings.BaseUrl}/cart");
        var cart = new CartPage(Page);
        await Expect(cart.CartHeading).ToBeVisibleAsync();
        await Expect(cart.CheckoutButton).ToBeVisibleAsync();

        await cart.ClickCheckoutAsync();
        await Expect(Page.Locator("text=Choose Payment Method")).ToBeVisibleAsync();
        await Expect(Page.Locator("text=Pay from Balance")).ToBeVisibleAsync();
        await Expect(Page.Locator("text=Pay with Card (Stripe)")).ToBeVisibleAsync();

        await Page.Locator("button:has-text('Cancel')").ClickAsync();
        await Expect(Page.Locator("text=Choose Payment Method")).ToBeHiddenAsync();
    }

    // ════════════════════════════════════════════════════════════════════════════
    // Journey 5 — Logged-in user inspects account pages then signs out
    // ════════════════════════════════════════════════════════════════════════════

    [Test]
    public async Task Journey_LoggedInUser_VisitsProfileOrdersThenLogsOut()
    {
        await Expect(Page.Locator("button[aria-label='User menu']")).ToBeVisibleAsync();

        await Page.Locator("button[aria-label='User menu']").ClickAsync();
        var profileLink = Page.Locator("header a[href='/profile']");
        await Expect(profileLink).ToBeVisibleAsync();
        await profileLink.ClickAsync();
        await Page.WaitForURLAsync("**/profile", new() { WaitUntil = WaitUntilState.DOMContentLoaded });
        await Expect(Page.Locator("h1").First).ToBeVisibleAsync();
        await Expect(Page.Locator("text=Member since")).ToBeVisibleAsync();

        await Page.Locator("button[aria-label='User menu']").ClickAsync();
        var ordersLink = Page.Locator("header a[href='/orders']");
        await Expect(ordersLink).ToBeVisibleAsync();
        await ordersLink.ClickAsync();
        await Page.WaitForURLAsync("**/orders", new() { WaitUntil = WaitUntilState.DOMContentLoaded });
        await Expect(Page.Locator("h1:has-text('Your Orders')")).ToBeVisibleAsync();

        await LogoutAsync();
        Assert.That(Page.Url, Does.Not.Contain("/profile"));
        Assert.That(Page.Url, Does.Not.Contain("/orders"));
    }
}
