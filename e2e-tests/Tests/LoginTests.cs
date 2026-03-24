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
}
