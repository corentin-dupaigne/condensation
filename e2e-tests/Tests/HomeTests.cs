using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Pages;

namespace Condensation.E2E.Tests.Tests;

[TestFixture]
public class HomeTests : BaseTest
{
    private HomePage _homePage = null!;

    [SetUp]
    public async Task SetUp()
    {
        _homePage = new HomePage(Page);
        await _homePage.NavigateAsync();
    }

    [Test]
    public async Task HomePage_ShouldLoadSuccessfully()
    {
        var title = await _homePage.GetTitleAsync();
        Assert.That(title, Is.Not.Empty);
    }

    [Test]
    public async Task HomePage_ShouldDisplayHeader()
    {
        var isVisible = await _homePage.Header.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task HomePage_ShouldDisplayFooter()
    {
        var isVisible = await _homePage.Footer.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task HomePage_ShouldDisplayRecommendedSection()
    {
        var isVisible = await _homePage.IsRecommendedSectionVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task HomePage_ShouldDisplayBestsellersSection()
    {
        var isVisible = await _homePage.IsBestsellersSectionVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task HomePage_ShouldDisplayNewReleasesSection()
    {
        var isVisible = await _homePage.IsNewReleasesSectionVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task HomePage_ShouldHaveGameCards()
    {
        var count = await _homePage.GetGameCardCountAsync();
        Assert.That(count, Is.GreaterThan(0));
    }

    [Test]
    public async Task HomePage_ShouldDisplayCartInHeader()
    {
        var cartLink = Page.Locator("header a[aria-label='Cart']");
        await Expect(cartLink).ToBeVisibleAsync();
    }

    [Test]
    public async Task HomePage_HeaderNavLinks_ShouldBeVisible()
    {
        foreach (var link in new[] { "Store", "Browse", "Deals", "Support" })
        {
            var navLink = _homePage.Header.NavLink(link);
            await Expect(navLink).ToBeVisibleAsync();
        }
    }

    // ── Trust bar section ─────────────────────────────────────────────────────

    [Test]
    public async Task HomePage_TrustBar_ShouldDisplayPaymentMethods()
    {
        var paymentBadges = Page.Locator("footer span:has-text('Visa'), footer span:has-text('PayPal')");
        var count = await paymentBadges.CountAsync();
        Assert.That(count, Is.GreaterThan(0));
    }

    // ── First game card navigation ────────────────────────────────────────────

    [Test]
    public async Task HomePage_ClickFirstGameCard_ShouldNavigateToProductPage()
    {
        var initialUrl = Page.Url;
        var firstCard = Page.Locator("main a[href*='/games/']").First;
        var href = await firstCard.GetAttributeAsync("href");
        await firstCard.ClickAsync();
        await Page.WaitForURLAsync("**/games/**", new() { WaitUntil = WaitUntilState.DOMContentLoaded });

        Assert.Multiple(() =>
        {
            Assert.That(Page.Url, Is.Not.EqualTo(initialUrl));
            Assert.That(Page.Url, Does.Contain("/games/"));
        });
    }

    // ── Section content ───────────────────────────────────────────────────────

    [Test]
    public async Task HomePage_ShouldDisplayPreOrdersSection()
    {
        var isVisible = await _homePage.IsPreOrdersSectionVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task HomePage_TrustBar_ShouldBePresent()
    {
        // The TrustBar renders a section with guarantee badges
        Assert.That(await Page.Locator("footer").IsVisibleAsync(), Is.True);
    }
}
