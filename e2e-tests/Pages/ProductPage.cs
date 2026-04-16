using Microsoft.Playwright;

namespace Condensation.E2E.Tests.Pages;

public class ProductPage : BasePage
{
    private readonly string _slug;

    protected override string PagePath => $"/games/{_slug}";

    // Product info
    private ILocator ProductTitle => Page.Locator("h1").First;
    private ILocator BuyNowButton => Page.Locator("button:has-text('Buy Now')");
    private ILocator AddToCartButton => Page.Locator("button:has-text('Add to Cart')");
    private ILocator WishlistButton => Page.Locator("button:has-text('Wishlist')");
    private ILocator PriceDisplay => Page.Locator("[class*='price']").First;

    // Media
    private ILocator MainMedia => Page.Locator("[class*='media'], [class*='hero'] img, [class*='hero'] video").First;
    private ILocator Thumbnails => Page.Locator("[class*='thumbnail'], [class*='thumb']");

    // Breadcrumb — the Breadcrumb component renders a plain <nav> with <a> links
    private ILocator BreadcrumbLinks => Page.Locator("main nav a, nav:has(a:has-text('Home')) a");

    // Game details
    private ILocator DeveloperInfo => Page.Locator("text=Developer").Locator("..");
    private ILocator PublisherInfo => Page.Locator("text=Publisher").Locator("..");

    // Related games
    private ILocator RelatedGames => Page.Locator("[class*='related'] [class*='card'], [class*='related'] a");

    public ProductPage(IPage page, string slug = "") : base(page)
    {
        _slug = slug;
    }

    public async Task<string> GetProductTitleAsync() => await ProductTitle.InnerTextAsync();

    public async Task ClickBuyNowAsync() => await BuyNowButton.ClickAsync();

    public async Task ClickAddToCartAsync() => await AddToCartButton.ClickAsync();

    public async Task ClickWishlistAsync() => await WishlistButton.ClickAsync();

    public async Task<int> GetThumbnailCountAsync() => await Thumbnails.CountAsync();

    public async Task ClickThumbnailAsync(int index) => await Thumbnails.Nth(index).ClickAsync();

    public async Task<bool> IsMainMediaVisibleAsync() => await MainMedia.IsVisibleAsync();

    public async Task<int> GetBreadcrumbCountAsync() => await BreadcrumbLinks.CountAsync();

    public async Task ClickBreadcrumbAsync(string text) =>
        await Page.Locator($"main nav a:has-text('{text}')").DispatchEventAsync("click");

    public async Task<int> GetRelatedGamesCountAsync() => await RelatedGames.CountAsync();

    public async Task<bool> IsBuyNowVisibleAsync() => await BuyNowButton.IsVisibleAsync();

    public async Task<bool> IsAddToCartVisibleAsync() => await AddToCartButton.IsVisibleAsync();
}
