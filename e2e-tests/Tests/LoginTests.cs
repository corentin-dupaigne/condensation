using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Pages;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

/// <summary>
/// Tests that verify the login/auth entry points from the frontend.
/// The actual login form is served by the external auth service (port 8000),
/// so these tests verify the Sign In link behavior and redirect from the
/// Next.js frontend (port 4000).
/// </summary>
[TestFixture]
public class LoginTests : BaseTest
{
    [SetUp]
    public async Task SetUp()
    {
        await Page.GotoAsync(TestSettings.BaseUrl, new PageGotoOptions { Timeout = 30_000 });
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
    }

    [Test]
    public async Task Auth_SignInLink_ShouldBeVisible()
    {
        var signInLink = Page.Locator("header a:has-text('Sign In')");
        await Expect(signInLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_SignInLink_ShouldPointToAuthLoginEndpoint()
    {
        var signInLink = Page.Locator("header a:has-text('Sign In')");
        var href = await signInLink.GetAttributeAsync("href");
        Assert.That(href, Does.Contain("auth").Or.Contain("login"));
    }

    [Test]
    public async Task Auth_SignInLink_ShouldBeVisibleOnCatalogPage()
    {
        await Page.GotoAsync($"{TestSettings.BaseUrl}/games", new PageGotoOptions { Timeout = 30_000 });
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var signInLink = Page.Locator("header a:has-text('Sign In')");
        await Expect(signInLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_SignInLink_ShouldBeVisibleOnCartPage()
    {
        await Page.GotoAsync($"{TestSettings.BaseUrl}/cart", new PageGotoOptions { Timeout = 30_000 });
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var signInLink = Page.Locator("header a:has-text('Sign In')");
        await Expect(signInLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_SignInLink_ShouldBeVisibleOnSearchPage()
    {
        await Page.GotoAsync($"{TestSettings.BaseUrl}/search", new PageGotoOptions { Timeout = 30_000 });
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var signInLink = Page.Locator("header a:has-text('Sign In')");
        await Expect(signInLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_SignUpLink_ShouldBeVisible()
    {
        var signUpLink = Page.Locator("header a:has-text('Sign Up')");
        await Expect(signUpLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task Auth_SignUpLink_ShouldPointToAuthRegisterEndpoint()
    {
        var signUpLink = Page.Locator("header a:has-text('Sign Up')");
        var href = await signUpLink.GetAttributeAsync("href");
        Assert.That(href, Does.Contain("auth").Or.Contain("register"));
    }

    [Test]
    public async Task Auth_BothAuthLinks_ShouldBeVisibleWhenNotLoggedIn()
    {
        var signInLink = Page.Locator("header a:has-text('Sign In')");
        var signUpLink = Page.Locator("header a:has-text('Sign Up')");

        await Expect(signInLink).ToBeVisibleAsync();
        await Expect(signUpLink).ToBeVisibleAsync();
    }
}
