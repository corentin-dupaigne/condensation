using Microsoft.Playwright;

namespace Condensation.E2E.Tests.Pages;

public class LoginPage : BasePage
{
    protected override string PagePath => "/login";

    // Form fields
    private ILocator EmailInput => Page.Locator("#email");
    private ILocator PasswordInput => Page.Locator("#password");
    private ILocator TogglePasswordButton => Page.Locator("button[aria-label='Show password'], button[aria-label='Hide password']");
    private ILocator SignInButton => Page.Locator("button[type='submit']");
    private ILocator ForgotPasswordLink => Page.Locator("a:has-text('Forgot password')");

    // OAuth
    private ILocator GoogleButton => Page.Locator("button[aria-label='Sign in with Google']");
    private ILocator SteamButton => Page.Locator("button[aria-label='Sign in with Steam']");
    private ILocator XboxButton => Page.Locator("button[aria-label='Sign in with Xbox']");
    private ILocator PlayStationButton => Page.Locator("button[aria-label='Sign in with PlayStation']");
    private ILocator DiscordButton => Page.Locator("button[aria-label='Sign in with Discord']");

    // Navigation
    private ILocator SignUpLink => Page.Locator("a:has-text('Sign up')");

    // Page elements
    private ILocator PageTitle => Page.Locator("h1");
    private ILocator PageSubtitle => Page.Locator("header p");

    public LoginPage(IPage page) : base(page) { }

    public async Task FillEmailAsync(string email) => await EmailInput.FillAsync(email);

    public async Task FillPasswordAsync(string password) => await PasswordInput.FillAsync(password);

    public async Task ClickSignInAsync() => await SignInButton.ClickAsync();

    public async Task LoginAsync(string email, string password)
    {
        await FillEmailAsync(email);
        await FillPasswordAsync(password);
        await ClickSignInAsync();
    }

    public async Task TogglePasswordVisibilityAsync() => await TogglePasswordButton.ClickAsync();

    public async Task<string> GetPasswordInputTypeAsync() =>
        await PasswordInput.GetAttributeAsync("type") ?? "password";

    public async Task ClickForgotPasswordAsync() => await ForgotPasswordLink.ClickAsync();

    public async Task ClickSignUpLinkAsync() => await SignUpLink.ClickAsync();

    public async Task ClickOAuthProviderAsync(string provider) =>
        await Page.Locator($"button[aria-label='Sign in with {provider}']").ClickAsync();

    public async Task<string> GetPageTitleTextAsync() => await PageTitle.InnerTextAsync();

    public async Task<bool> IsSignInButtonVisibleAsync() => await SignInButton.IsVisibleAsync();

    public async Task<bool> IsEmailInputVisibleAsync() => await EmailInput.IsVisibleAsync();

    public async Task<int> GetOAuthButtonCountAsync() =>
        await Page.Locator("button[aria-label^='Sign in with']").CountAsync();
}
