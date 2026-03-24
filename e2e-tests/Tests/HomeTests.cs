using NUnit.Framework;
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
        var cartCount = await _homePage.Header.GetCartCountAsync();
        Assert.That(cartCount, Is.Not.Empty);
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
}
