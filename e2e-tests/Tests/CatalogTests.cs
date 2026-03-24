using NUnit.Framework;
using Condensation.E2E.Tests.Pages;

namespace Condensation.E2E.Tests.Tests;

[TestFixture]
public class CatalogTests : BaseTest
{
    private CatalogPage _catalogPage = null!;

    [SetUp]
    public async Task SetUp()
    {
        _catalogPage = new CatalogPage(Page);
        await _catalogPage.NavigateAsync();
    }

    [Test]
    public async Task CatalogPage_ShouldLoadSuccessfully()
    {
        var title = await _catalogPage.GetTitleAsync();
        Assert.That(title, Does.Contain("Catalog"));
    }

    [Test]
    public async Task CatalogPage_ShouldDisplayHeader()
    {
        var isVisible = await _catalogPage.Header.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task CatalogPage_ShouldDisplayFooter()
    {
        var isVisible = await _catalogPage.Footer.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task CatalogPage_ShouldDisplayGameCards()
    {
        var count = await _catalogPage.GetGameCardCountAsync();
        Assert.That(count, Is.GreaterThan(0));
    }

    [Test]
    public async Task CatalogPage_ShouldNavigateToProductOnCardClick()
    {
        var initialUrl = Page.Url;
        await _catalogPage.ClickGameCardAsync(0);
        await Page.WaitForLoadStateAsync();
        Assert.That(Page.Url, Is.Not.EqualTo(initialUrl));
    }
}
