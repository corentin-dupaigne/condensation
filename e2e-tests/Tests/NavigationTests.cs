using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Pages;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

/// <summary>
/// Cross-page navigation tests that verify the global header elements
/// (logo, nav links, search bar, cart icon, auth links) route the user
/// to the correct destinations.
/// </summary>
[TestFixture]
public class NavigationTests : BaseTest
{
    [SetUp]
    public async Task SetUp()
    {
        // Start every test from the home page
        await GoToAsync(TestSettings.BaseUrl);
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
    }

    // ── Logo ──────────────────────────────────────────────────────────────────

    [Test]
    public async Task Header_Logo_ShouldNavigateToHome()
    {
        // Navigate away first
        await GoToAsync($"{TestSettings.BaseUrl}/games");
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var catalogPage = new CatalogPage(Page);
        await catalogPage.Header.ClickLogoAsync();
        await Page.WaitForURLAsync(url => !url.Contains("/games"), new() { WaitUntil = WaitUntilState.DOMContentLoaded });

        Assert.That(Page.Url.TrimEnd('/'), Is.EqualTo(TestSettings.BaseUrl.TrimEnd('/')));
    }

    // ── Cart icon ─────────────────────────────────────────────────────────────

    [Test]
    public async Task Header_CartLink_ShouldNavigateToCart()
    {
        var cartLink = Page.Locator("header a[aria-label='Cart']");
        await cartLink.ClickAsync(new LocatorClickOptions { Force = true });
        await Page.WaitForURLAsync("**/cart", new() { WaitUntil = WaitUntilState.DOMContentLoaded });
        Assert.That(Page.Url, Does.Contain("/cart"));
    }

    [Test]
    public async Task Header_CartLink_ShouldExistAndPointToCart()
    {
        var cartLink = Page.Locator("header a[aria-label='Cart']");
        await Expect(cartLink).ToBeVisibleAsync();
        var href = await cartLink.GetAttributeAsync("href");
        Assert.That(href, Does.Contain("/cart"));
    }

    // ── Nav links ─────────────────────────────────────────────────────────────

    [Test]
    public async Task Header_BrowseNavLink_ShouldNavigateToCatalog()
    {
        var homePage = new HomePage(Page);
        await homePage.Header.ClickNavLinkAsync("Browse");
        await Page.WaitForURLAsync("**/games", new() { WaitUntil = WaitUntilState.DOMContentLoaded });
        Assert.That(Page.Url, Does.Contain("/games"));
    }

    [Test]
    public async Task Header_StoreNavLink_ShouldNavigateToHome()
    {
        // Start from catalog so "Store" actually causes a navigation
        await GoToAsync($"{TestSettings.BaseUrl}/games");
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var catalogPage = new CatalogPage(Page);
        await catalogPage.Header.ClickNavLinkAsync("Store");
        await Page.WaitForURLAsync(url => !url.Contains("/games"), new() { WaitUntil = WaitUntilState.DOMContentLoaded });

        Assert.That(Page.Url.TrimEnd('/'), Is.EqualTo(TestSettings.BaseUrl.TrimEnd('/')));
    }

    [Test]
    public async Task Header_NavLinks_ShouldHaveCorrectHrefs()
    {
        var homePage = new HomePage(Page);

        var browseLink = homePage.Header.NavLink("Browse");
        var storeLink = homePage.Header.NavLink("Store");

        await Expect(browseLink).ToBeVisibleAsync();
        await Expect(storeLink).ToBeVisibleAsync();

        var browseHref = await browseLink.GetAttributeAsync("href");
        var storeHref = await storeLink.GetAttributeAsync("href");

        Assert.Multiple(() =>
        {
            Assert.That(browseHref, Does.Contain("/games"));
            Assert.That(storeHref, Does.Contain("/").Or.EqualTo("/"));
        });
    }

    // ── Search ────────────────────────────────────────────────────────────────

    [Test]
    public async Task Header_Search_Submit_ShouldNavigateToSearchPage()
    {
        var homePage = new HomePage(Page);
        await homePage.Header.SearchAsync("counter-strike");

        await Page.WaitForURLAsync("**/search?q=**", new() { WaitUntil = WaitUntilState.DOMContentLoaded });
        Assert.Multiple(() =>
        {
            Assert.That(Page.Url, Does.Contain("/search"));
            Assert.That(Page.Url, Does.Contain("counter-strike"));
        });
    }

    [Test]
    public async Task Header_Search_Typing_ShouldShowPreviewDropdown()
    {
        await Page.Locator("header input[placeholder*='Search']").FillAsync("elden");

        var preview = Page.Locator("header div[class*='absolute'][class*='top-full']");
        await Expect(preview).ToBeVisibleAsync();
    }

    [Test]
    public async Task Header_Search_Escape_ShouldHidePreviewDropdown()
    {
        var searchInput = Page.Locator("header input[placeholder*='Search']");
        await searchInput.FillAsync("elden");

        var preview = Page.Locator("header div[class*='absolute'][class*='top-full']");
        await Expect(preview).ToBeVisibleAsync();

        await searchInput.PressAsync("Escape");
        await Expect(preview).ToBeHiddenAsync();
    }

    // ── Auth links ────────────────────────────────────────────────────────────

    [Test]
    public async Task Header_SignInLink_ShouldPointToAuthEndpoint()
    {
        var signInLink = Page.Locator("header a:has-text('Sign In')");
        await Expect(signInLink).ToBeVisibleAsync();

        var href = await signInLink.GetAttributeAsync("href");
        Assert.That(href, Does.Contain("auth").Or.Contain("login"));
    }

    [Test]
    public async Task Header_SignUpLink_ShouldPointToAuthEndpoint()
    {
        var signUpLink = Page.Locator("header a:has-text('Sign Up')");
        await Expect(signUpLink).ToBeVisibleAsync();

        var href = await signUpLink.GetAttributeAsync("href");
        Assert.That(href, Does.Contain("auth").Or.Contain("register"));
    }
}
