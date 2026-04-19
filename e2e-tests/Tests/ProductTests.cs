using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Pages;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

[TestFixture]
public class ProductTests : BaseTest
{
    private ProductPage _productPage = null!;

    [SetUp]
    public async Task SetUp()
    {
        await GoToAsync($"{TestSettings.BaseUrl}/games");

        var href = await Page.Locator("a[href*='/games/']").First.GetAttributeAsync("href");
        await GoToAsync($"{TestSettings.BaseUrl}{href}");

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
        await Page.WaitForURLAsync(url => !url.Contains("/games/"), new() { WaitUntil = WaitUntilState.DOMContentLoaded });
        Assert.That(Page.Url.TrimEnd('/'), Is.EqualTo(TestSettings.BaseUrl.TrimEnd('/')));
    }

    // ── CTA buttons ───────────────────────────────────────────────────────────

    [Test]
    public async Task ProductPage_ShouldDisplayBuyNowButton()
    {
        var isVisible = await _productPage.IsBuyNowVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task ProductPage_ShouldDisplayAddToCartButton()
    {
        var isVisible = await _productPage.IsAddToCartVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task ProductPage_ShouldDisplayWishlistButton()
    {
        var wishlistButton = Page.Locator("button:has-text('Wishlist')");
        await Expect(wishlistButton).ToBeVisibleAsync();
    }

    [Test]
    public async Task ProductPage_AddToCart_ShouldShowAddedFeedback()
    {
        await _productPage.ClickAddToCartAsync();
        // The button text temporarily changes to "Added!" for 2 s
        var addedLabel = Page.Locator("button:has-text('Added!')");
        await Expect(addedLabel).ToBeVisibleAsync();
    }

    [Test]
    public async Task ProductPage_AddToCart_ShouldIncrementHeaderCartBadge()
    {
        await _productPage.ClickAddToCartAsync();

        var cartBadge = Page.Locator("header a[aria-label='Cart'] span");
        await Expect(cartBadge).ToBeVisibleAsync();
        var countText = await cartBadge.InnerTextAsync();
        Assert.That(int.Parse(countText.Trim()), Is.GreaterThanOrEqualTo(1));
    }

    // ── Edition selector ──────────────────────────────────────────────────────

    [Test]
    public async Task ProductPage_ShouldDisplayStandardEditionButton()
    {
        var standardBtn = Page.Locator("button:has-text('Steam key')");
        await Expect(standardBtn).ToBeVisibleAsync();
    }

    [Test]
    public async Task ProductPage_ShouldDisplayDeluxeEditionButton()
    {
        var deluxeBtn = Page.Locator("button:has-text('Steam price')");
        await Expect(deluxeBtn).ToBeVisibleAsync();
    }

    // ── Media gallery ─────────────────────────────────────────────────────────

    [Test]
    public async Task ProductPage_ThumbnailGallery_ShouldContainAtLeastOneThumbnail()
    {
        var thumbnailButtons = Page.Locator("div.custom-scrollbar button");
        var count = await thumbnailButtons.CountAsync();
        Assert.That(count, Is.GreaterThanOrEqualTo(1));
    }

    [Test]
    public async Task ProductPage_ThumbnailClick_ShouldChangeActiveMedia()
    {
        var thumbnails = Page.Locator("div.custom-scrollbar button");
        var count = await thumbnails.CountAsync();

        if (count < 2)
            Assert.Inconclusive("Not enough thumbnails to test switching.");

        // Find the first thumbnail that is a screenshot (has an <img> but no play-icon overlay)
        // Movies come first in the media array, so we need to find a screenshot thumbnail
        var screenshotIndex = -1;
        for (int i = 0; i < count; i++)
        {
            var overlay = thumbnails.Nth(i).Locator("div.absolute");
            if (await overlay.CountAsync() == 0)
            {
                screenshotIndex = i;
                break;
            }
        }

        if (screenshotIndex < 0)
            Assert.Inconclusive("No screenshot thumbnails found to test switching.");

        await thumbnails.Nth(screenshotIndex).ClickAsync();

        var mainImg = Page.Locator("section.mx-auto div.aspect-video img").First;
        await Expect(mainImg).ToBeVisibleAsync();
        var srcBefore = await mainImg.GetAttributeAsync("src");

        var secondIndex = -1;
        for (int i = 0; i < count; i++)
        {
            if (i == screenshotIndex) continue;
            var overlay = thumbnails.Nth(i).Locator("div.absolute");
            if (await overlay.CountAsync() == 0)
            {
                secondIndex = i;
                break;
            }
        }

        if (secondIndex < 0)
            Assert.Inconclusive("Only one screenshot thumbnail — cannot test switching.");

        await thumbnails.Nth(secondIndex).ClickAsync();
        await Expect(mainImg).Not.ToHaveAttributeAsync("src", srcBefore ?? "");
    }
}
