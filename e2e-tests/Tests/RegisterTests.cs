using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

/// <summary>
/// Tests for the registration form served by the auth service.
/// Navigates via the frontend's Sign Up link through the OAuth redirect chain
/// to reach the actual register form, then verifies its structure.
///
/// Note: header auth-link visibility is already covered by LoginTests and NavigationTests.
/// </summary>
[TestFixture]
public class RegisterTests : BaseTest
{
    [SetUp]
    public async Task SetUp()
    {
        await GoToAsync(TestSettings.BaseUrl);
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
    }

    [Test]
    public async Task Auth_SignUpLink_Click_ShouldNavigateToAuthForm()
    {
        await Page.Locator("header a:has-text('Sign Up')").ClickAsync();
        await Expect(Page.Locator("#email, #username, input[name='email']").First).ToBeVisibleAsync();
    }

    [Test]
    public async Task RegisterForm_ShouldDisplayEmailInput()
    {
        await NavigateToRegisterFormAsync();
        await Expect(Page.Locator("#email")).ToBeVisibleAsync();
    }

    [Test]
    public async Task RegisterForm_ShouldDisplayPasswordInput()
    {
        await NavigateToRegisterFormAsync();
        await Expect(Page.Locator("#password")).ToBeVisibleAsync();
    }

    [Test]
    public async Task RegisterForm_ShouldDisplaySubmitButton()
    {
        await NavigateToRegisterFormAsync();
        var submitBtn = Page.Locator("button[type='submit']");
        await Expect(submitBtn).ToBeVisibleAsync();
    }

    [Test]
    public async Task RegisterForm_ShouldDisplaySignInLink()
    {
        await NavigateToRegisterFormAsync();
        var signInLink = Page.Locator("a:has-text('Sign in'), a:has-text('Log in')");
        await Expect(signInLink).ToBeVisibleAsync();
    }

    private async Task NavigateToRegisterFormAsync()
    {
        await GoToAsync("http://localhost:8000/register");
        await Page.Locator("#email, #username, input[name='email']").First.WaitForAsync();
    }
}
