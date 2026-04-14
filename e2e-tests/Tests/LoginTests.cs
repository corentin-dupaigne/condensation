using NUnit.Framework;
using Condensation.E2E.Tests.Pages;

namespace Condensation.E2E.Tests.Tests;

[TestFixture]
public class LoginTests : BaseTest
{
    private LoginPage _loginPage = null!;

    [SetUp]
    public async Task SetUp()
    {
        _loginPage = new LoginPage(Page);
        await _loginPage.NavigateAsync();
    }

    [Test]
    public async Task LoginPage_ShouldLoadSuccessfully()
    {
        var titleText = await _loginPage.GetPageTitleTextAsync();
        Assert.That(titleText.ToUpper(), Does.Contain("SIGN IN"));
    }

    [Test]
    public async Task LoginPage_ShouldDisplayEmailAndPasswordFields()
    {
        var isEmailVisible = await _loginPage.IsEmailInputVisibleAsync();
        var isSignInVisible = await _loginPage.IsSignInButtonVisibleAsync();
        Assert.Multiple(() =>
        {
            Assert.That(isEmailVisible, Is.True);
            Assert.That(isSignInVisible, Is.True);
        });
    }

    [Test]
    public async Task LoginPage_ShouldTogglePasswordVisibility()
    {
        await _loginPage.FillPasswordAsync("testpassword");

        var typeBefore = await _loginPage.GetPasswordInputTypeAsync();
        Assert.That(typeBefore, Is.EqualTo("password"));

        await _loginPage.TogglePasswordVisibilityAsync();

        var typeAfter = await _loginPage.GetPasswordInputTypeAsync();
        Assert.That(typeAfter, Is.EqualTo("text"));
    }

    [Test]
    public async Task LoginPage_ShouldHaveFiveOAuthProviders()
    {
        var count = await _loginPage.GetOAuthButtonCountAsync();
        Assert.That(count, Is.EqualTo(5));
    }

    [Test]
    public async Task LoginPage_SignUpLink_ShouldNavigateToRegister()
    {
        await _loginPage.ClickSignUpLinkAsync();
        await Page.WaitForURLAsync("**/register");
        Assert.That(Page.Url, Does.Contain("/register"));
    }

    [Test]
    public async Task LoginPage_ShouldAllowFillingLoginForm()
    {
        await _loginPage.FillEmailAsync("test@example.com");
        await _loginPage.FillPasswordAsync("Password123!");

        var isSignInVisible = await _loginPage.IsSignInButtonVisibleAsync();
        Assert.That(isSignInVisible, Is.True);
    }

    [Test]
    public async Task LoginPage_ForgotPasswordLink_ShouldBeVisible()
    {
        var forgotLink = Page.Locator("a:has-text('Forgot password')");
        await Expect(forgotLink).ToBeVisibleAsync();
    }

    // ── Navigation from login ─────────────────────────────────────────────────

    [Test]
    public async Task LoginPage_ForgotPasswordLink_ShouldNavigateToReset()
    {
        await _loginPage.ClickForgotPasswordAsync();
        await Page.WaitForLoadStateAsync(Microsoft.Playwright.LoadState.NetworkIdle);
        Assert.That(Page.Url, Does.Contain("forgot").Or.Contain("reset").Or.Contain("password"));
    }

    // ── Form validation ───────────────────────────────────────────────────────

    [Test]
    public async Task LoginPage_EmptyForm_Submit_ShouldNotNavigateAway()
    {
        var initialUrl = Page.Url;
        await _loginPage.ClickSignInAsync();
        await Page.WaitForLoadStateAsync(Microsoft.Playwright.LoadState.DOMContentLoaded);
        // HTML5 validation prevents submission; URL stays the same
        Assert.That(Page.Url, Is.EqualTo(initialUrl));
    }

    [Test]
    public async Task LoginPage_InvalidEmailFormat_ShouldNotSubmit()
    {
        await _loginPage.FillEmailAsync("notanemail");
        await _loginPage.FillPasswordAsync("Password123!");
        var initialUrl = Page.Url;
        await _loginPage.ClickSignInAsync();
        await Page.WaitForLoadStateAsync(Microsoft.Playwright.LoadState.DOMContentLoaded);
        Assert.That(Page.Url, Is.EqualTo(initialUrl));
    }

    // ── Password toggle ───────────────────────────────────────────────────────

    [Test]
    public async Task LoginPage_PasswordToggle_ShouldRestorePasswordType()
    {
        await _loginPage.FillPasswordAsync("secret");
        await _loginPage.TogglePasswordVisibilityAsync(); // show
        await _loginPage.TogglePasswordVisibilityAsync(); // hide again
        var type = await _loginPage.GetPasswordInputTypeAsync();
        Assert.That(type, Is.EqualTo("password"));
    }

    // ── OAuth buttons ─────────────────────────────────────────────────────────

    [Test]
    public async Task LoginPage_OAuthButtons_ShouldAllBeVisible()
    {
        var oauthButtons = Page.Locator("button[aria-label^='Sign in with']");
        var count = await oauthButtons.CountAsync();
        for (var i = 0; i < count; i++)
        {
            await Expect(oauthButtons.Nth(i)).ToBeVisibleAsync();
        }
    }
}
