using Microsoft.Playwright;

namespace Condensation.E2E.Tests.Pages.Components;

public class HeaderComponent
{
    private readonly IPage _page;

    // Locators
    private ILocator Logo => _page.Locator("header a", new() { HasTextString = "CONDENSATION" });
    private ILocator SearchInput => _page.Locator("header input[placeholder*='Search']");
    private ILocator SignInLink => _page.Locator("header a", new() { HasTextString = "Sign In" });
    private ILocator SignUpLink => _page.Locator("header a", new() { HasTextString = "Sign Up" });
    private ILocator SignOutLink => _page.Locator("header a", new() { HasTextString = "Sign Out" });
    private ILocator UserGreeting => _page.Locator("header span:has-text('Hello,')");
    private ILocator CartButton => _page.Locator("header a[aria-label='Cart']");
    private ILocator CartBadge => _page.Locator("header a[aria-label='Cart'] span");

    public HeaderComponent(IPage page)
    {
        _page = page;
    }

    public ILocator NavLink(string text) =>
        _page.Locator($"header nav a:has-text('{text}')");

    /// <summary>
    /// Use JavaScript click (DispatchEvent) to bypass the Next.js dev overlay
    /// that intercepts pointer events. Unlike Force=true which still dispatches
    /// at the element's coordinates (overlay can intercept), DispatchEvent sends
    /// the event directly to the DOM element.
    /// </summary>
    private static async Task JsClickAsync(ILocator locator)
    {
        await locator.DispatchEventAsync("click");
    }

    public async Task ClickLogoAsync() => await JsClickAsync(Logo);

    public async Task SearchAsync(string query)
    {
        await SearchInput.FillAsync(query);
        await SearchInput.PressAsync("Enter");
    }

    public async Task FillSearchAsync(string query) => await SearchInput.FillAsync(query);

    public async Task ClickSignInAsync() => await JsClickAsync(SignInLink);

    public async Task ClickSignUpAsync() => await JsClickAsync(SignUpLink);

    public async Task ClickSignOutAsync() => await JsClickAsync(SignOutLink);

    public async Task ClickCartAsync() => await JsClickAsync(CartButton);

    public async Task<bool> IsLoggedInAsync() => await UserGreeting.IsVisibleAsync();

    public async Task<string> GetUserNameAsync() => await UserGreeting.InnerTextAsync();

    public async Task<string> GetCartCountAsync() => await CartBadge.InnerTextAsync();

    public async Task<bool> IsVisibleAsync() => await Logo.IsVisibleAsync();

    public async Task ClickNavLinkAsync(string text) => await JsClickAsync(NavLink(text));
}
