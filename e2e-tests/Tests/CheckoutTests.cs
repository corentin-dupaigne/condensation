using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Pages;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

/// <summary>
/// Tests for the checkout flow (requires authentication).
/// Covers: Proceed to Checkout → Payment method modal → Balance / Stripe options.
/// Does NOT complete an actual payment (would require Stripe test mode).
/// </summary>
[TestFixture]
public class CheckoutTests : AuthenticatedBaseTest
{
    /// <summary>
    /// Adds the first available game to the cart via the catalog → product → add flow,
    /// then navigates to /cart ready for checkout assertions.
    /// </summary>
    private async Task AddItemToCartAndGoToCartAsync()
    {
        var catalogPage = new CatalogPage(Page);
        await catalogPage.NavigateAsync();

        var firstGameLink = Page.Locator("main a[href*='/games/']").First;
        var href = await firstGameLink.GetAttributeAsync("href");

        await GoToAsync($"{TestSettings.BaseUrl}{href}");

        await Page.Locator("button:has-text('Add to Cart')").First.ClickAsync();
        await Expect(Page.Locator("button:has-text('Added!')")).ToBeVisibleAsync();

        await GoToAsync($"{TestSettings.BaseUrl}/cart");
        await Expect(Page.Locator("h1").First).ToBeVisibleAsync();
    }

    // ── Payment method modal ────────────────────────────────────────────────────

    [Test]
    public async Task Checkout_ProceedButton_ShouldOpenPaymentModal()
    {
        await AddItemToCartAndGoToCartAsync();

        await Page.Locator("button:has-text('Proceed to Checkout')").ClickAsync();

        var modalTitle = Page.Locator("text=Choose Payment Method");
        await Expect(modalTitle).ToBeVisibleAsync();
    }

    [Test]
    public async Task Checkout_PaymentModal_ShouldDisplayPaymentOptions()
    {
        await AddItemToCartAndGoToCartAsync();
        await Page.Locator("button:has-text('Proceed to Checkout')").ClickAsync();

        var paymentOptions = Page.Locator("[data-testid='payment-options']");
        await Expect(paymentOptions).ToBeVisibleAsync();
    }

    [Test]
    public async Task Checkout_PaymentModal_ShouldDisplayBalanceOption()
    {
        await AddItemToCartAndGoToCartAsync();
        await Page.Locator("button:has-text('Proceed to Checkout')").ClickAsync();

        var balanceOption = Page.Locator("text=Pay from Balance");
        await Expect(balanceOption).ToBeVisibleAsync();
    }

    [Test]
    public async Task Checkout_PaymentModal_ShouldDisplayStripeOption()
    {
        await AddItemToCartAndGoToCartAsync();
        await Page.Locator("button:has-text('Proceed to Checkout')").ClickAsync();

        var stripeOption = Page.Locator("text=Pay with Card (Stripe)");
        await Expect(stripeOption).ToBeVisibleAsync();
    }

    [Test]
    public async Task Checkout_PaymentModal_ShouldDisplayTotalAmount()
    {
        await AddItemToCartAndGoToCartAsync();
        await Page.Locator("button:has-text('Proceed to Checkout')").ClickAsync();

        // Total line in the modal: "Total: $XX.XX"
        var total = Page.GetByText("Total", new() { Exact = true });
        await Expect(total).ToBeVisibleAsync();
    }

    [Test]
    public async Task Checkout_PaymentModal_BalanceOption_ShouldShowCurrentBalance()
    {
        await AddItemToCartAndGoToCartAsync();
        await Page.Locator("button:has-text('Proceed to Checkout')").ClickAsync();

        // The balance option shows "Balance: $XX.XX"
        var balance = Page.Locator("text=/Balance.*\\$/");
        await Expect(balance).ToBeVisibleAsync();
    }

    [Test]
    public async Task Checkout_PaymentModal_ShouldDisplayCancelButton()
    {
        await AddItemToCartAndGoToCartAsync();
        await Page.Locator("button:has-text('Proceed to Checkout')").ClickAsync();

        var cancelBtn = Page.Locator("button:has-text('Cancel')");
        await Expect(cancelBtn).ToBeVisibleAsync();
    }

    [Test]
    public async Task Checkout_PaymentModal_Cancel_ShouldCloseModal()
    {
        await AddItemToCartAndGoToCartAsync();
        await Page.Locator("button:has-text('Proceed to Checkout')").ClickAsync();

        var modalTitle = Page.Locator("text=Choose Payment Method");
        await Expect(modalTitle).ToBeVisibleAsync();

        await Page.Locator("button:has-text('Cancel')").ClickAsync();
        await Expect(modalTitle).ToBeHiddenAsync();
    }
}
