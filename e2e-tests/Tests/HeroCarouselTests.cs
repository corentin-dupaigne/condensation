using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Pages;

namespace Condensation.E2E.Tests.Tests;

/// <summary>
/// Tests for the HeroCarousel component on the home page.
///
/// The carousel exposes rich ARIA attributes (role="region", aria-roledescription,
/// aria-current, aria-label) which are used as stable selectors throughout these
/// tests — keeping them decoupled from CSS class names.
/// </summary>
[TestFixture]
public class HeroCarouselTests : BaseTest
{
    private HomePage _homePage = null!;

    // Stable locators derived directly from the carousel's ARIA markup
    private ILocator Carousel => Page.Locator("section[aria-label='Featured games']");
    private ILocator PrevButton => Page.Locator("button[aria-label='Previous slide']");
    private ILocator NextButton => Page.Locator("button[aria-label='Next slide']");
    private ILocator DotButtons => Page.Locator("button[aria-label^='Go to slide']");
    private ILocator ActiveDot => Page.Locator("button[aria-current='true']");

    [SetUp]
    public async Task SetUp()
    {
        _homePage = new HomePage(Page);
        await _homePage.NavigateAsync();
    }

    // ── Visibility ────────────────────────────────────────────────────────────

    [Test]
    public async Task HeroCarousel_ShouldBeVisible()
    {
        await Expect(Carousel).ToBeVisibleAsync();
    }

    [Test]
    public async Task HeroCarousel_ShouldHaveCorrectAriaRole()
    {
        var role = await Carousel.GetAttributeAsync("aria-roledescription");
        Assert.That(role, Is.EqualTo("carousel"));
    }

    // ── Navigation arrows ─────────────────────────────────────────────────────

    [Test]
    public async Task HeroCarousel_ShouldDisplayNavigationArrows()
    {
        // Arrows are visible at the 1920×1080 viewport configured in BaseTest
        Assert.Multiple(async () =>
        {
            Assert.That(await PrevButton.IsVisibleAsync(), Is.True);
            Assert.That(await NextButton.IsVisibleAsync(), Is.True);
        });
    }

    [Test]
    public async Task HeroCarousel_NextButton_ShouldAdvanceSlide()
    {
        await Carousel.HoverAsync();
        var labelBefore = await ActiveDot.GetAttributeAsync("aria-label");

        await NextButton.ClickAsync();
        await Expect(ActiveDot).Not.ToHaveAttributeAsync("aria-label", labelBefore ?? "");
    }

    [Test]
    public async Task HeroCarousel_PrevButton_ShouldGoToPreviousSlide()
    {
        await Carousel.HoverAsync();

        var firstLabel = await ActiveDot.GetAttributeAsync("aria-label");
        await NextButton.ClickAsync();
        await Expect(ActiveDot).Not.ToHaveAttributeAsync("aria-label", firstLabel ?? "");

        var labelAfterNext = await ActiveDot.GetAttributeAsync("aria-label");
        await PrevButton.ClickAsync();
        await Expect(ActiveDot).Not.ToHaveAttributeAsync("aria-label", labelAfterNext ?? "");
    }

    // ── Dot navigation ────────────────────────────────────────────────────────

    [Test]
    public async Task HeroCarousel_ShouldHaveFiveDots()
    {
        // Five slides are hard-coded in HeroCarousel.tsx
        var count = await DotButtons.CountAsync();
        Assert.That(count, Is.EqualTo(5));
    }

    [Test]
    public async Task HeroCarousel_DotClick_ShouldActivateCorrespondingSlide()
    {
        await Carousel.HoverAsync();

        var thirdDot = DotButtons.Nth(2);
        var thirdDotLabel = await thirdDot.GetAttributeAsync("aria-label");

        await thirdDot.ClickAsync();
        await Expect(ActiveDot).ToHaveAttributeAsync("aria-label", thirdDotLabel ?? "");
    }

    [Test]
    public async Task HeroCarousel_OnLoad_FirstDotShouldBeActive()
    {
        var firstDotLabel = await DotButtons.First.GetAttributeAsync("aria-label");
        var activeLabel = await ActiveDot.GetAttributeAsync("aria-label");
        Assert.That(activeLabel, Is.EqualTo(firstDotLabel));
    }

    // ── CTA link ──────────────────────────────────────────────────────────────

    [Test]
    public async Task HeroCarousel_BuyNowCTA_ShouldBeVisibleAndLinkToProduct()
    {
        var buyNow = Carousel.Locator("a:has-text('BUY NOW')");
        await Expect(buyNow).ToBeVisibleAsync();

        var href = await buyNow.GetAttributeAsync("href");
        Assert.That(href, Does.Contain("/games/"));
    }

    [Test]
    public async Task HeroCarousel_BuyNowCTA_ShouldNavigateToProductPage()
    {
        // Hover to pause auto-advance, then click the CTA
        await Carousel.HoverAsync();

        var buyNow = Carousel.Locator("a:has-text('BUY NOW')");
        await buyNow.ClickAsync(new LocatorClickOptions { Force = true });
        await Page.WaitForURLAsync("**/games/**", new() { WaitUntil = WaitUntilState.DOMContentLoaded });

        Assert.That(Page.Url, Does.Contain("/games/"));
    }
}
