using NUnit.Framework;
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

public class BaseTest : PageTest
{
    public override BrowserNewContextOptions ContextOptions()
    {
        return new BrowserNewContextOptions
        {
            BaseURL = TestSettings.BaseUrl,
            ViewportSize = new ViewportSize { Width = 1920, Height = 1080 },
            IgnoreHTTPSErrors = true
        };
    }

    [SetUp]
    public async Task BaseSetUp()
    {
        Page.SetDefaultTimeout(TestSettings.DefaultTimeout);
        Page.SetDefaultNavigationTimeout(TestSettings.DefaultTimeout);
    }

    /// <summary>
    /// Performs a full login via the OAuth/PKCE flow:
    /// frontend Sign In → auth service form → callback → frontend home (logged in).
    /// </summary>
    protected async Task LoginAsync()
    {
        await Page.GotoAsync(TestSettings.BaseUrl, new PageGotoOptions { Timeout = 30_000 });
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var signInLink = Page.Locator("header a:has-text('Sign In')");
        await signInLink.ClickAsync();

        // Wait for auth service login form (cross-origin redirect)
        await Page.Locator("#email").WaitForAsync(new() { Timeout = 30_000 });

        await Page.Locator("#email").FillAsync(TestSettings.TestUserEmail);
        await Page.Locator("#password").FillAsync(TestSettings.TestUserPassword);
        await Page.Locator("button[type='submit']").ClickAsync();

        // Wait for OAuth redirect back to the frontend (skip the /api/auth/callback intermediary)
        await Page.WaitForURLAsync(
            url => url.StartsWith(TestSettings.BaseUrl) && !url.Contains("/api/auth/"),
            new() { Timeout = 30_000 }
        );
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
    }

    /// <summary>
    /// Opens the user menu dropdown and clicks Logout.
    /// </summary>
    protected async Task LogoutAsync()
    {
        await Page.Locator("button[aria-label='User menu']").ClickAsync();
        await Page.Locator("button:has-text('Logout')").ClickAsync();
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
    }
}
