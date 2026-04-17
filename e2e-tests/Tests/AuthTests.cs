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
        await Page.GotoAsync(TestSettings.BaseUrl, new PageGotoOptions { Timeout = 30_000 });
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
    }

    // ── Login form ──────────────────────────────────────────────────────────────

    [Test]
    public async Task Auth_SignInLink_ShouldRedirectToLoginForm()
    {
        var signInLink = Page.Locator("header a:has-text('Sign In')");
        await signInLink.ClickAsync();

        await Page.Locator("#email").WaitForAsync(new() { Timeout = 30_000 });

        Assert.Multiple(async () =>
        {
            Assert.That(await Page.Locator("#email").IsVisibleAsync(), Is.True);
            Assert.That(await Page.Locator("#password").IsVisibleAsync(), Is.True);
            Assert.That(await Page.Locator("button[type='submit']").IsVisibleAsync(), Is.True);
        });
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

        await Page.GotoAsync($"{TestSettings.BaseUrl}/games", new PageGotoOptions { Timeout = 30_000 });
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var userMenu = Page.Locator("button[aria-label='User menu']");
        await Expect(userMenu).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_Session_ShouldPersistOnCartPage()
    {
        await LoginAsync();

        await Page.GotoAsync($"{TestSettings.BaseUrl}/cart", new PageGotoOptions { Timeout = 30_000 });
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var userMenu = Page.Locator("button[aria-label='User menu']");
        await Expect(userMenu).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_Session_ShouldPersistOnSearchPage()
    {
        await LoginAsync();

        await Page.GotoAsync($"{TestSettings.BaseUrl}/search", new PageGotoOptions { Timeout = 30_000 });
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
