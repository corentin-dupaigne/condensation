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
    private ILocator CartButton => _page.Locator("header button[aria-label='Cart']");
    private ILocator CartBadge => _page.Locator("header button[aria-label='Cart'] span");

    public HeaderComponent(IPage page)
    {
        _page = page;
    }

    public ILocator NavLink(string text) =>
        _page.Locator($"header nav a:has-text('{text}')");

    public async Task ClickLogoAsync() => await Logo.ClickAsync();

    public async Task SearchAsync(string query)
    {
        await SearchInput.FillAsync(query);
        await SearchInput.PressAsync("Enter");
    }

    public async Task FillSearchAsync(string query) => await SearchInput.FillAsync(query);

    public async Task ClickSignInAsync() => await SignInLink.ClickAsync();

    public async Task ClickSignUpAsync() => await SignUpLink.ClickAsync();

    public async Task ClickSignOutAsync() => await SignOutLink.ClickAsync();

    public async Task ClickCartAsync() => await CartButton.ClickAsync();

    public async Task<bool> IsLoggedInAsync() => await UserGreeting.IsVisibleAsync();

    public async Task<string> GetUserNameAsync() => await UserGreeting.InnerTextAsync();

    public async Task<string> GetCartCountAsync() => await CartBadge.InnerTextAsync();

    public async Task<bool> IsVisibleAsync() => await Logo.IsVisibleAsync();

    public async Task ClickNavLinkAsync(string text) => await NavLink(text).ClickAsync();
}
