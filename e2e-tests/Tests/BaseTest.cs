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
    /// Fails fast on a 5xx response so tests don't sit on Playwright's polling timeout.
    /// Includes a best-effort short Load wait so React hydrates before interactions.
    /// </summary>
    protected async Task GoToAsync(string url)
    {
        var response = await Page.GotoAsync(url, new PageGotoOptions { WaitUntil = WaitUntilState.DOMContentLoaded });
        if (response is not null && response.Status >= 500)
        {
            var body = await Page.ContentAsync();
            var hint = body.Contains("oauth-private.key") ? " (Passport private key unreadable — regenerate it)" : "";
            Assert.Fail($"Navigation to {url} returned HTTP {response.Status}{hint}");
        }
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

        // Race: either the login form renders, or the auth service returned an error page.
        // Whichever appears first decides — avoids waiting the full DefaultTimeout when
        // Laravel blows up on the /oauth/authorize redirect (e.g. Passport key unreadable).
        var emailField = Page.Locator("#email");
        var errorPage = Page.Locator("text=/Internal Server Error|LogicException|RuntimeException/");
        var which = await Task.WhenAny(
            emailField.WaitForAsync(new() { State = WaitForSelectorState.Visible }),
            errorPage.WaitForAsync(new() { State = WaitForSelectorState.Visible })
        );
        await which;
        if (await errorPage.IsVisibleAsync())
        {
            Assert.Fail($"Auth service error page at {Page.Url} — check auth container logs");
        }

        await emailField.FillAsync(TestSettings.TestUserEmail);
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
