using NUnit.Framework;
using Condensation.E2E.Tests.Pages;

namespace Condensation.E2E.Tests.Tests;

[TestFixture]
public class ProductTests : BaseTest
{
    private ProductPage _productPage = null!;
    private CatalogPage _catalogPage = null!;

    [SetUp]
    public async Task SetUp()
    {
        // Navigate to catalog first, then click on first game to reach a product page
        _catalogPage = new CatalogPage(Page);
        await _catalogPage.NavigateAsync();
        await _catalogPage.ClickGameCardAsync(0);
        await Page.WaitForLoadStateAsync(Microsoft.Playwright.LoadState.NetworkIdle);

        _productPage = new ProductPage(Page);
    }

    [Test]
    public async Task ProductPage_ShouldDisplayProductTitle()
    {
        var title = await _productPage.GetProductTitleAsync();
        Assert.That(title, Is.Not.Empty);
    }

    [Test]
    public async Task ProductPage_ShouldDisplayHeader()
    {
        var isVisible = await _productPage.Header.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task ProductPage_ShouldDisplayFooter()
    {
        var isVisible = await _productPage.Footer.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task ProductPage_ShouldHaveBreadcrumbs()
    {
        var count = await _productPage.GetBreadcrumbCountAsync();
        Assert.That(count, Is.GreaterThanOrEqualTo(2));
    }

    [Test]
    public async Task ProductPage_BreadcrumbHome_ShouldNavigateToHomePage()
    {
        await _productPage.ClickBreadcrumbAsync("Home");
        await Page.WaitForURLAsync("**/");
        Assert.That(Page.Url, Does.EndWith("/"));
    }
}
