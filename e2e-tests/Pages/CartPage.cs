using Microsoft.Playwright;

namespace Condensation.E2E.Tests.Pages;

public class CartPage : BasePage
{
    protected override string PagePath => "/cart";

    // Empty state
    // Use href selector to avoid matching the footer "Browse Games" link (href="#")
    private ILocator EmptyCartMessage => Page.Locator("p:has-text('Your cart is empty')");
    private ILocator BrowseGamesLink => Page.Locator("a[href='/games']:has-text('Browse')");
    private ILocator BackToHomeLink => Page.Locator("a[href='/']:has-text('Back to home')");

    // Cart with items
    private ILocator CartHeading => Page.Locator("h1").First;
    private ILocator ClearCartButton => Page.Locator("button:has-text('Clear cart')");

    // Order summary card
    private ILocator OrderSummaryHeading => Page.Locator("h2:has-text('Order Summary')");
    private ILocator CheckoutButton => Page.Locator("button:has-text('Proceed to Checkout')");

    // Per-item controls (aria-label based — one per cart row)
    private ILocator IncreaseQuantityButtons => Page.Locator("button[aria-label^='Increase quantity']");
    private ILocator DecreaseQuantityButtons => Page.Locator("button[aria-label^='Decrease quantity']");
    private ILocator RemoveItemButtons => Page.Locator("button[aria-label^='Remove']");

    // Recommended section at the bottom
    private ILocator CompleteOrderHeading => Page.Locator("h2:has-text('Complete Your Order')");

    public CartPage(IPage page) : base(page) { }

    // ── Empty state ─────────────────────────────────────────────────────────────

    public async Task<bool> IsEmptyCartVisibleAsync() =>
        await EmptyCartMessage.IsVisibleAsync();

    public async Task<bool> IsBrowseGamesLinkVisibleAsync() =>
        await BrowseGamesLink.IsVisibleAsync();

    public async Task<bool> IsBackToHomeLinkVisibleAsync() =>
        await BackToHomeLink.IsVisibleAsync();

    // Force = true bypasses the Next.js dev overlay portal that intercepts pointer events
    public async Task ClickBrowseGamesAsync() =>
        await BrowseGamesLink.ClickAsync(new LocatorClickOptions { Force = true });

    public async Task ClickBackToHomeAsync() =>
        await BackToHomeLink.ClickAsync(new LocatorClickOptions { Force = true });

    // ── Cart with items ──────────────────────────────────────────────────────────

    public async Task<string> GetCartHeadingTextAsync() =>
        await CartHeading.InnerTextAsync();

    /// <summary>Number of items currently shown in the cart (one increase-button per row).</summary>
    public async Task<int> GetCartItemCountAsync() =>
        await IncreaseQuantityButtons.CountAsync();

    public async Task<bool> IsOrderSummaryVisibleAsync() =>
        await OrderSummaryHeading.IsVisibleAsync();

    public async Task<bool> IsCheckoutButtonVisibleAsync() =>
        await CheckoutButton.IsVisibleAsync();

    public async Task<bool> IsClearCartButtonVisibleAsync() =>
        await ClearCartButton.IsVisibleAsync();

    public async Task<bool> IsCompleteOrderSectionVisibleAsync() =>
        await CompleteOrderHeading.IsVisibleAsync();

    public async Task ClickClearCartAsync() => await ClearCartButton.ClickAsync();

    public async Task ClickCheckoutAsync() => await CheckoutButton.ClickAsync();

    public async Task ClickIncreaseQuantityAsync(int index = 0) =>
        await IncreaseQuantityButtons.Nth(index).ClickAsync();

    public async Task ClickDecreaseQuantityAsync(int index = 0) =>
        await DecreaseQuantityButtons.Nth(index).ClickAsync();

    public async Task ClickRemoveItemAsync(int index = 0) =>
        await RemoveItemButtons.Nth(index).ClickAsync();
}
