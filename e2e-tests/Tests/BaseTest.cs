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
    /// Navigate using DOMContentLoaded — Next.js dev pages may never fire the `load` event
    /// because of long-lived HMR sockets and streaming responses.
    /// Includes a best-effort short Load wait so React hydrates before interactions.
    /// </summary>
    protected async Task GoToAsync(string url)
    {
        await Page.GotoAsync(url, new PageGotoOptions { WaitUntil = WaitUntilState.DOMContentLoaded });
        try { await Page.WaitForLoadStateAsync(LoadState.Load, new() { Timeout = 5_000 }); }
        catch (TimeoutException) { }
    }

    /// <summary>
    /// Performs a full login via the OAuth/PKCE flow:
    /// frontend Sign In → auth service form → callback → frontend home (logged in).
    /// </summary>
    protected async Task LoginAsync()
    {
        await GoToAsync(TestSettings.BaseUrl);
        await Page.Locator("header a:has-text('Sign In')").ClickAsync();

        await Page.Locator("#email").FillAsync(TestSettings.TestUserEmail);
        await Page.Locator("#password").FillAsync(TestSettings.TestUserPassword);
        await Page.Locator("button[type='submit']").ClickAsync();

        await Page.WaitForURLAsync(
            url => url.StartsWith(TestSettings.BaseUrl) && !url.Contains("/api/auth/")
        , new() { WaitUntil = WaitUntilState.DOMContentLoaded });
        await Expect(Page.Locator("button[aria-label='User menu']")).ToBeVisibleAsync();
    }

    /// <summary>
    /// Opens the user menu dropdown and clicks Logout.
    /// </summary>
    protected async Task LogoutAsync()
    {
        await Page.Locator("button[aria-label='User menu']").ClickAsync();
        await Page.Locator("button:has-text('Logout')").ClickAsync();
        await Expect(Page.Locator("header a:has-text('Sign In')")).ToBeVisibleAsync();
    }
}
