using Microsoft.Playwright;

namespace Condensation.E2E.Tests.Pages;

public class RegisterPage : BasePage
{
    protected override string PagePath => "/register";

    // Form fields
    private ILocator UsernameInput => Page.Locator("#username");
    private ILocator EmailInput => Page.Locator("#email");
    private ILocator PasswordInput => Page.Locator("#password");
    private ILocator ConfirmPasswordInput => Page.Locator("#confirm-password");
    private ILocator TermsCheckbox => Page.Locator("button[role='checkbox']");
    private ILocator CreateAccountButton => Page.Locator("button[type='submit']");

    // Password toggles
    private ILocator PasswordToggle => Page.Locator("#password ~ button, div:has(> #password) button");
    private ILocator ConfirmPasswordToggle => Page.Locator("#confirm-password ~ button, div:has(> #confirm-password) button");

    // OAuth
    private ILocator OAuthButtons => Page.Locator("button[aria-label^='Sign up with']");

    // Navigation
    private ILocator SignInLink => Page.Locator("a:has-text('Sign in')");

    // Page elements
    private ILocator PageTitle => Page.Locator("h1");

    public RegisterPage(IPage page) : base(page) { }

    public async Task FillUsernameAsync(string username) => await UsernameInput.FillAsync(username);

    public async Task FillEmailAsync(string email) => await EmailInput.FillAsync(email);

    public async Task FillPasswordAsync(string password) => await PasswordInput.FillAsync(password);

    public async Task FillConfirmPasswordAsync(string password) => await ConfirmPasswordInput.FillAsync(password);

    public async Task ToggleTermsCheckboxAsync() => await TermsCheckbox.ClickAsync();

    public async Task ClickCreateAccountAsync() => await CreateAccountButton.ClickAsync();

    public async Task<bool> IsCreateAccountEnabledAsync() => await CreateAccountButton.IsEnabledAsync();

    public async Task<bool> IsTermsCheckedAsync()
    {
        var ariaChecked = await TermsCheckbox.GetAttributeAsync("aria-checked");
        return ariaChecked == "true";
    }

    public async Task RegisterAsync(string username, string email, string password)
    {
        await FillUsernameAsync(username);
        await FillEmailAsync(email);
        await FillPasswordAsync(password);
        await FillConfirmPasswordAsync(password);
        await ToggleTermsCheckboxAsync();
        await ClickCreateAccountAsync();
    }

    public async Task ClickSignInLinkAsync() => await SignInLink.ClickAsync();

    public async Task<string> GetPageTitleTextAsync() => await PageTitle.InnerTextAsync();

    public async Task<int> GetOAuthButtonCountAsync() => await OAuthButtons.CountAsync();

    public async Task<string> GetPasswordInputTypeAsync() =>
        await PasswordInput.GetAttributeAsync("type") ?? "password";

    public async Task TogglePasswordVisibilityAsync() => await PasswordToggle.ClickAsync();
}
