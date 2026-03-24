using Microsoft.Playwright;

namespace Condensation.E2E.Tests.Pages;

public class HomePage : BasePage
{
    protected override string PagePath => "/";

    // Sections
    private ILocator HeroCarousel => Page.Locator("section").First;
    private ILocator RecommendedSection => Page.Locator("text=Recommended For You").First;
    private ILocator BestsellersSection => Page.Locator("text=Bestsellers").First;
    private ILocator NewReleasesSection => Page.Locator("text=New Releases").First;
    private ILocator PreOrdersSection => Page.Locator("text=Pre-Orders").First;

    // Newsletter
    private ILocator NewsletterEmailInput => Page.Locator("input[placeholder*='email' i]");
    private ILocator NewsletterSubmitButton => Page.Locator("button:has-text('Subscribe'), button:has-text('subscribe')");

    // Game cards
    private ILocator GameCards => Page.Locator("[class*='game-card'], a[href*='/games/']");

    public HomePage(IPage page) : base(page) { }

    public async Task<bool> IsHeroCarouselVisibleAsync() =>
        await HeroCarousel.IsVisibleAsync();

    public async Task<bool> IsRecommendedSectionVisibleAsync() =>
        await RecommendedSection.IsVisibleAsync();

    public async Task<bool> IsBestsellersSectionVisibleAsync() =>
        await BestsellersSection.IsVisibleAsync();

    public async Task<bool> IsNewReleasesSectionVisibleAsync() =>
        await NewReleasesSection.IsVisibleAsync();

    public async Task<bool> IsPreOrdersSectionVisibleAsync() =>
        await PreOrdersSection.IsVisibleAsync();

    public async Task SubscribeNewsletterAsync(string email)
    {
        await NewsletterEmailInput.FillAsync(email);
        await NewsletterSubmitButton.ClickAsync();
    }

    public async Task<int> GetGameCardCountAsync() =>
        await GameCards.CountAsync();

    public async Task ClickFirstGameCardAsync() =>
        await GameCards.First.ClickAsync();
}
