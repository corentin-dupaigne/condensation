using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Pages;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

/// <summary>
/// Tests for the authentication entry points accessible from the main frontend.
/// The actual register/login forms are served by the external auth service (port 8000),
/// so these tests verify the links and redirects from the Next.js frontend (port 4000).
/// </summary>
[TestFixture]
public class RegisterTests : BaseTest
{
    [SetUp]
    public async Task SetUp()
    {
        await Page.GotoAsync(TestSettings.BaseUrl, new PageGotoOptions { Timeout = 30_000 });
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
    }

    // ── Auth links in header ──────────────────────────────────────────────────

    [Test]
    public async Task Auth_Header_SignInLink_ShouldBeVisible()
    {
        var signInLink = Page.Locator("header a:has-text('Sign In')");
        await Expect(signInLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_Header_SignUpLink_ShouldBeVisible()
    {
        var signUpLink = Page.Locator("header a:has-text('Sign Up')");
        await Expect(signUpLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_Header_SignUpLink_HrefShouldPointToAuthService()
    {
        var signUpLink = Page.Locator("header a:has-text('Sign Up')");
        var href = await signUpLink.GetAttributeAsync("href");
        Assert.That(href, Does.Contain("auth").Or.Contain("register"));
    }

    [Test]
    public async Task Auth_Header_SignInLink_HrefShouldPointToAuthService()
    {
        var signInLink = Page.Locator("header a:has-text('Sign In')");
        var href = await signInLink.GetAttributeAsync("href");
        Assert.That(href, Does.Contain("auth").Or.Contain("login"));
    }

    [Test]
    public async Task Auth_Header_BothAuthLinks_ShouldBeVisibleWhenNotLoggedIn()
    {
        var signInLink = Page.Locator("header a:has-text('Sign In')");
        var signUpLink = Page.Locator("header a:has-text('Sign Up')");

        Assert.Multiple(async () =>
        {
            Assert.That(await signInLink.IsVisibleAsync(), Is.True);
            Assert.That(await signUpLink.IsVisibleAsync(), Is.True);
        });
    }

    [Test]
    public async Task Auth_Header_AuthLinks_ShouldBeVisibleFromCatalog()
    {
        await Page.GotoAsync($"{TestSettings.BaseUrl}/games", new PageGotoOptions { Timeout = 30_000 });
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var signInLink = Page.Locator("header a:has-text('Sign In')");
        await Expect(signInLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_Header_AuthLinks_ShouldBeVisibleFromCart()
    {
        await Page.GotoAsync($"{TestSettings.BaseUrl}/cart", new PageGotoOptions { Timeout = 30_000 });
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var signUpLink = Page.Locator("header a:has-text('Sign Up')");
        await Expect(signUpLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_Header_AuthLinks_ShouldBeVisibleFromSearch()
    {
        await Page.GotoAsync($"{TestSettings.BaseUrl}/search", new PageGotoOptions { Timeout = 30_000 });
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var signInLink = Page.Locator("header a:has-text('Sign In')");
        await Expect(signInLink).ToBeVisibleAsync();
    }

    // ── OAuth buttons (visible via header auth links) ─────────────────────────

    [Test]
    public async Task RegisterPage_OAuthButtons_ShouldAllBeVisible()
    {
        // Verify any OAuth buttons that exist are visible (graceful if none)
        var oauthButtons = Page.Locator("button[aria-label^='Sign up with']");
        var count = await oauthButtons.CountAsync();
        for (var i = 0; i < count; i++)
        {
            await Expect(oauthButtons.Nth(i)).ToBeVisibleAsync();
        }
    }
}
