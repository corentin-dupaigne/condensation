using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

/// <summary>
/// Tests for the full authentication lifecycle: login form, logged-in state,
/// session persistence across pages, user menu, and logout.
/// </summary>
[TestFixture]
public class AuthTests : BaseTest
{
    [SetUp]
    public async Task SetUp()
    {
        await GoToAsync(TestSettings.BaseUrl);
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
    }

    // ── Login form ──────────────────────────────────────────────────────────────

    [Test]
    public async Task Auth_SignInLink_ShouldRedirectToLoginForm()
    {
        await Page.Locator("header a:has-text('Sign In')").ClickAsync();

        await Expect(Page.Locator("#email")).ToBeVisibleAsync();
        await Expect(Page.Locator("#password")).ToBeVisibleAsync();
        await Expect(Page.Locator("button[type='submit']")).ToBeVisibleAsync();
    }

    // ── Successful login ────────────────────────────────────────────────────────

    [Test]
    public async Task Auth_Login_ShouldRedirectBackToFrontend()
    {
        await LoginAsync();
        Assert.That(Page.Url, Does.StartWith(TestSettings.BaseUrl));
    }

    [Test]
    public async Task Auth_Login_ShouldShowUserMenuButton()
    {
        await LoginAsync();

        var userMenu = Page.Locator("button[aria-label='User menu']");
        await Expect(userMenu).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_Login_ShouldHideSignInLink()
    {
        await LoginAsync();

        var signInLink = Page.Locator("header a:has-text('Sign In')");
        await Expect(signInLink).ToBeHiddenAsync();
    }

    [Test]
    public async Task Auth_Login_ShouldHideSignUpLink()
    {
        await LoginAsync();

        var signUpLink = Page.Locator("header a:has-text('Sign Up')");
        await Expect(signUpLink).ToBeHiddenAsync();
    }

    // ── User menu dropdown ──────────────────────────────────────────────────────

    [Test]
    public async Task Auth_UserMenu_Click_ShouldOpenDropdown()
    {
        await LoginAsync();

        await Page.Locator("button[aria-label='User menu']").ClickAsync();

        var profileLink = Page.Locator("a:has-text('My Profile')");
        await Expect(profileLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_UserMenu_ShouldDisplayProfileLink()
    {
        await LoginAsync();
        await Page.Locator("button[aria-label='User menu']").ClickAsync();

        var href = await Page.Locator("a:has-text('My Profile')").GetAttributeAsync("href");
        Assert.That(href, Does.Contain("/profile"));
    }

    [Test]
    public async Task Auth_UserMenu_ShouldDisplayOrdersLink()
    {
        await LoginAsync();
        await Page.Locator("button[aria-label='User menu']").ClickAsync();

        var ordersLink = Page.Locator("header a[href='/orders']");
        await Expect(ordersLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_UserMenu_ShouldDisplaySettingsLink()
    {
        await LoginAsync();
        await Page.Locator("button[aria-label='User menu']").ClickAsync();

        var settingsLink = Page.Locator("header a[href='/settings']");
        await Expect(settingsLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_UserMenu_ShouldDisplayLogoutButton()
    {
        await LoginAsync();
        await Page.Locator("button[aria-label='User menu']").ClickAsync();

        var logoutBtn = Page.Locator("button:has-text('Logout')");
        await Expect(logoutBtn).ToBeVisibleAsync();
    }

    // ── Session persistence ─────────────────────────────────────────────────────

    [Test]
    public async Task Auth_Session_ShouldPersistOnCatalogPage()
    {
        await LoginAsync();

        await GoToAsync($"{TestSettings.BaseUrl}/games");
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var userMenu = Page.Locator("button[aria-label='User menu']");
        await Expect(userMenu).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_Session_ShouldPersistOnCartPage()
    {
        await LoginAsync();

        await GoToAsync($"{TestSettings.BaseUrl}/cart");
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var userMenu = Page.Locator("button[aria-label='User menu']");
        await Expect(userMenu).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_Session_ShouldPersistOnSearchPage()
    {
        await LoginAsync();

        await GoToAsync($"{TestSettings.BaseUrl}/search");
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var userMenu = Page.Locator("button[aria-label='User menu']");
        await Expect(userMenu).ToBeVisibleAsync();
    }

    // ── Logout ──────────────────────────────────────────────────────────────────

    [Test]
    public async Task Auth_Logout_ShouldShowSignInLink()
    {
        await LoginAsync();
        await LogoutAsync();

        var signInLink = Page.Locator("header a:has-text('Sign In')");
        await Expect(signInLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_Logout_ShouldHideUserMenu()
    {
        await LoginAsync();
        await LogoutAsync();

        var userMenu = Page.Locator("button[aria-label='User menu']");
        await Expect(userMenu).ToBeHiddenAsync();
    }

    [Test]
    public async Task Auth_Logout_ShouldShowSignUpLink()
    {
        await LoginAsync();
        await LogoutAsync();

        var signUpLink = Page.Locator("header a:has-text('Sign Up')");
        await Expect(signUpLink).ToBeVisibleAsync();
    }
}
