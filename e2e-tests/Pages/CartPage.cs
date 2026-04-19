using Microsoft.Playwright;

namespace Condensation.E2E.Tests.Pages;

public class CartPage : BasePage
{
    protected override string PagePath => "/cart";

    // Empty state
    public ILocator EmptyCartMessage => Page.Locator("p:has-text('Your cart is empty')");
    public ILocator BrowseGamesLink => Page.Locator("main a[href='/games']:has-text('Browse games')");
    public ILocator BackToHomeLink => Page.Locator("main a[href='/']:has-text('Back to home')");

    // Cart with items
    public ILocator CartHeading => Page.Locator("h1").First;
    public ILocator ClearCartButton => Page.Locator("button:has-text('Clear cart')");

    // Order summary card
    public ILocator OrderSummaryHeading => Page.Locator("h2:has-text('Order Summary')");
    public ILocator CheckoutButton => Page.Locator("button:has-text('Proceed to Checkout')");

    // Per-item controls (aria-label based — one per cart row)
    public ILocator IncreaseQuantityButtons => Page.Locator("button[aria-label^='Increase quantity']");
    public ILocator DecreaseQuantityButtons => Page.Locator("button[aria-label^='Decrease quantity']");
    public ILocator RemoveItemButtons => Page.Locator("button[aria-label^='Remove']");

    // Recommended section at the bottom
    public ILocator CompleteOrderHeading => Page.Locator("h2:has-text('Complete Your Order')");

    public CartPage(IPage page) : base(page) { }

    public async Task ClickBrowseGamesAsync() =>
        await BrowseGamesLink.ClickAsync(new LocatorClickOptions { Force = true });

    public async Task ClickBackToHomeAsync() =>
        await BackToHomeLink.ClickAsync(new LocatorClickOptions { Force = true });

    public async Task<string> GetCartHeadingTextAsync() =>
        await CartHeading.InnerTextAsync();

    /// <summary>Number of items currently shown in the cart (one increase-button per row).</summary>
    public async Task<int> GetCartItemCountAsync() =>
        await IncreaseQuantityButtons.CountAsync();

    public async Task ClickClearCartAsync() => await ClearCartButton.ClickAsync();

    public async Task ClickCheckoutAsync() => await CheckoutButton.ClickAsync();

    public async Task ClickIncreaseQuantityAsync(int index = 0) =>
        await IncreaseQuantityButtons.Nth(index).ClickAsync();

    public async Task ClickDecreaseQuantityAsync(int index = 0) =>
        await DecreaseQuantityButtons.Nth(index).ClickAsync();

    public async Task ClickRemoveItemAsync(int index = 0) =>
        await RemoveItemButtons.Nth(index).ClickAsync();
}
