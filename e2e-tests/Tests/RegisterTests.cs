using NUnit.Framework;
using Condensation.E2E.Tests.Pages;

namespace Condensation.E2E.Tests.Tests;

[TestFixture]
public class RegisterTests : BaseTest
{
    private RegisterPage _registerPage = null!;

    [SetUp]
    public async Task SetUp()
    {
        _registerPage = new RegisterPage(Page);
        await _registerPage.NavigateAsync();
    }

    [Test]
    public async Task RegisterPage_ShouldLoadSuccessfully()
    {
        var titleText = await _registerPage.GetPageTitleTextAsync();
        Assert.That(titleText.ToUpper(), Does.Contain("SIGN UP"));
    }

    [Test]
    public async Task RegisterPage_CreateAccountButton_ShouldBeDisabledByDefault()
    {
        var isEnabled = await _registerPage.IsCreateAccountEnabledAsync();
        Assert.That(isEnabled, Is.False);
    }

    [Test]
    public async Task RegisterPage_ShouldEnableButtonAfterAcceptingTerms()
    {
        await _registerPage.ToggleTermsCheckboxAsync();

        var isChecked = await _registerPage.IsTermsCheckedAsync();
        var isEnabled = await _registerPage.IsCreateAccountEnabledAsync();

        Assert.Multiple(() =>
        {
            Assert.That(isChecked, Is.True);
            Assert.That(isEnabled, Is.True);
        });
    }

    [Test]
    public async Task RegisterPage_ShouldTogglePasswordVisibility()
    {
        await _registerPage.FillPasswordAsync("testpassword");

        var typeBefore = await _registerPage.GetPasswordInputTypeAsync();
        Assert.That(typeBefore, Is.EqualTo("password"));

        await _registerPage.TogglePasswordVisibilityAsync();

        var typeAfter = await _registerPage.GetPasswordInputTypeAsync();
        Assert.That(typeAfter, Is.EqualTo("text"));
    }

    [Test]
    public async Task RegisterPage_ShouldHaveFiveOAuthProviders()
    {
        var count = await _registerPage.GetOAuthButtonCountAsync();
        Assert.That(count, Is.EqualTo(5));
    }

    [Test]
    public async Task RegisterPage_SignInLink_ShouldNavigateToLogin()
    {
        await _registerPage.ClickSignInLinkAsync();
        await Page.WaitForURLAsync("**/login");
        Assert.That(Page.Url, Does.Contain("/login"));
    }

    [Test]
    public async Task RegisterPage_ShouldAllowFillingRegistrationForm()
    {
        await _registerPage.FillUsernameAsync("testuser");
        await _registerPage.FillEmailAsync("test@example.com");
        await _registerPage.FillPasswordAsync("Password123!");
        await _registerPage.FillConfirmPasswordAsync("Password123!");
        await _registerPage.ToggleTermsCheckboxAsync();

        var isEnabled = await _registerPage.IsCreateAccountEnabledAsync();
        Assert.That(isEnabled, Is.True);
    }
}
