using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Pages;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

/// <summary>
/// Tests for the /profile page (requires authentication).
/// Verifies profile header, stats, tabs, and Steam integration section.
/// </summary>
[TestFixture]
public class ProfileTests : AuthenticatedBaseTest
{
    [SetUp]
    public async Task SetUp()
    {
        await GoToAsync($"{TestSettings.BaseUrl}/profile");
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
    }

    // ── Profile header ──────────────────────────────────────────────────────────

    [Test]
    public async Task ProfilePage_ShouldDisplayUsername()
    {
        var heading = Page.Locator("h1").First;
        var text = await heading.InnerTextAsync();
        Assert.That(text, Is.Not.Empty);
    }

    [Test]
    public async Task ProfilePage_ShouldDisplayMemberSinceDate()
    {
        var memberSince = Page.Locator("text=Member since");
        await Expect(memberSince).ToBeVisibleAsync();
    }

    [Test]
    public async Task ProfilePage_ShouldDisplayBadgesCount()
    {
        var badges = Page.Locator("text=/\\d+ Badge/");
        await Expect(badges).ToBeVisibleAsync();
    }

    [Test]
    public async Task ProfilePage_ShouldDisplayOrdersCount()
    {
        var orders = Page.Locator("text=/\\d+ Order/");
        await Expect(orders).ToBeVisibleAsync();
    }

    [Test]
    public async Task ProfilePage_ShouldDisplayEditProfileButton()
    {
        var editButton = Page.Locator("a:has-text('Edit Profile')");
        await Expect(editButton).ToBeVisibleAsync();
    }

    [Test]
    public async Task ProfilePage_EditProfileButton_ShouldLinkToSettings()
    {
        var editButton = Page.Locator("a:has-text('Edit Profile')");
        var href = await editButton.GetAttributeAsync("href");
        Assert.That(href, Does.Contain("/settings"));
    }

    // ── Tabs ────────────────────────────────────────────────────────────────────

    [Test]
    public async Task ProfilePage_ShouldDisplayAllTabs()
    {
        Assert.Multiple(async () =>
        {
            Assert.That(await Page.Locator("button:has-text('Overview')").IsVisibleAsync(), Is.True);
            Assert.That(await Page.Locator("button:has-text('Badges')").IsVisibleAsync(), Is.True);
            Assert.That(await Page.Locator("button:has-text('Order History')").IsVisibleAsync(), Is.True);
        });
    }

    [Test]
    public async Task ProfilePage_BadgesTab_ShouldSwitchContent()
    {
        await Page.Locator("button:has-text('Badges')").ClickAsync();
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        // Badges tab should show badge cards or an empty state
        var main = Page.Locator("main");
        await Expect(main).ToBeVisibleAsync();
    }

    [Test]
    public async Task ProfilePage_OrderHistoryTab_ShouldSwitchContent()
    {
        await Page.Locator("button:has-text('Order History')").ClickAsync();
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        var main = Page.Locator("main");
        await Expect(main).ToBeVisibleAsync();
    }

    // ── Steam integration ───────────────────────────────────────────────────────

    [Test]
    public async Task ProfilePage_ShouldDisplaySteamSection()
    {
        var steamHeading = Page.GetByRole(AriaRole.Heading, new() { Name = "Steam Account" });
        await Expect(steamHeading).ToBeVisibleAsync();
    }

    [Test]
    public async Task ProfilePage_ShouldDisplayLinkSteamButton()
    {
        var linkBtn = Page.Locator("button:has-text('Link Steam'), a:has-text('Link Steam')");
        await Expect(linkBtn).ToBeVisibleAsync();
    }

    // ── Layout ──────────────────────────────────────────────────────────────────

    [Test]
    public async Task ProfilePage_ShouldDisplayHeader()
    {
        var homePage = new HomePage(Page);
        var isVisible = await homePage.Header.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task ProfilePage_ShouldDisplayFooter()
    {
        var homePage = new HomePage(Page);
        var isVisible = await homePage.Footer.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    // ── Navigation ──────────────────────────────────────────────────────────────

    [Test]
    public async Task ProfilePage_ShouldBeAccessibleFromUserMenu()
    {
        await GoToAsync(TestSettings.BaseUrl);
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        await Page.Locator("button[aria-label='User menu']").ClickAsync();
        await Page.Locator("a:has-text('My Profile')").ClickAsync();
        await Page.WaitForURLAsync("**/profile", new() { WaitUntil = WaitUntilState.DOMContentLoaded });

        Assert.That(Page.Url, Does.Contain("/profile"));
    }
}
