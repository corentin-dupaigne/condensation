using NUnit.Framework;
using Microsoft.Playwright;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

/// <summary>
/// Tests for the /settings page (requires authentication).
/// Covers all five sections: Account, Wallet, Linked Accounts, Notifications, Privacy.
/// </summary>
[TestFixture]
public class SettingsTests : AuthenticatedBaseTest
{
    [SetUp]
    public async Task SetUp()
    {
        await GoToAsync($"{TestSettings.BaseUrl}/settings");
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
    }

    // ── Sidebar navigation ──────────────────────────────────────────────────────

    [Test]
    public async Task SettingsPage_ShouldDisplayAllSectionButtons()
    {
        foreach (var section in new[] { "Account", "Wallet", "Linked Accounts", "Notifications", "Privacy" })
        {
            var btn = Page.Locator($"button:text-is('{section}')");
            await Expect(btn).ToBeVisibleAsync();
        }
    }

    // ── Account section ─────────────────────────────────────────────────────────

    [Test]
    public async Task Settings_Account_ShouldDisplayDisplayNameInput()
    {
        await Page.Locator("button:text-is('Account')").ClickAsync();
        var nameInput = Page.Locator("input[placeholder='Your display name']");
        await Expect(nameInput).ToBeVisibleAsync();
    }

    [Test]
    public async Task Settings_Account_ShouldDisplayEmailInput()
    {
        await Page.Locator("button:text-is('Account')").ClickAsync();
        var emailInput = Page.Locator("input[placeholder='your@email.com']");
        await Expect(emailInput).ToBeVisibleAsync();
    }

    [Test]
    public async Task Settings_Account_ShouldDisplaySaveButton()
    {
        await Page.Locator("button:text-is('Account')").ClickAsync();
        var saveBtn = Page.Locator("button:has-text('Save Changes')");
        await Expect(saveBtn).ToBeVisibleAsync();
    }

    [Test]
    public async Task Settings_Account_ShouldDisplayResetPasswordButton()
    {
        await Page.Locator("button:text-is('Account')").ClickAsync();
        var resetBtn = Page.Locator("button:has-text('Reset Password')");
        await Expect(resetBtn).ToBeVisibleAsync();
    }

    [Test]
    public async Task Settings_Account_ShouldDisplayDeleteAccountButton()
    {
        await Page.Locator("button:text-is('Account')").ClickAsync();
        var deleteBtn = Page.Locator("button:has-text('Delete Account')");
        await Expect(deleteBtn).ToBeVisibleAsync();
    }

    // ── Wallet section ──────────────────────────────────────────────────────────

    [Test]
    public async Task Settings_Wallet_ShouldDisplayCurrentBalanceLabel()
    {
        await Page.Locator("button:has-text('Wallet')").ClickAsync();
        var balanceLabel = Page.Locator("text=Current Balance");
        await Expect(balanceLabel).ToBeVisibleAsync();
    }

    [Test]
    public async Task Settings_Wallet_ShouldDisplayBalanceAmount()
    {
        await Page.Locator("button:has-text('Wallet')").ClickAsync();
        // Balance format: "$X.XX"
        var balanceAmount = Page.Locator("text=/\\$\\d/");
        await Expect(balanceAmount).ToBeVisibleAsync();
    }

    [Test]
    public async Task Settings_Wallet_ShouldDisplayTopUpButton()
    {
        await Page.Locator("button:has-text('Wallet')").ClickAsync();
        var topUpBtn = Page.Locator("button:has-text('Top Up')");
        await Expect(topUpBtn).ToBeVisibleAsync();
    }

    [Test]
    public async Task Settings_Wallet_TopUpButton_ShouldOpenModal()
    {
        await Page.Locator("button:has-text('Wallet')").ClickAsync();
        await Page.Locator("button:has-text('Top Up')").ClickAsync();

        var modalTitle = Page.Locator("text=Top Up Balance");
        await Expect(modalTitle).ToBeVisibleAsync();
    }

    [Test]
    public async Task Settings_Wallet_TopUpModal_ShouldDisplayPresetAmounts()
    {
        await Page.Locator("button:has-text('Wallet')").ClickAsync();
        await Page.Locator("button:has-text('Top Up')").ClickAsync();

        foreach (var amount in new[] { "$5", "$10", "$25", "$50", "$100" })
        {
            var btn = Page.Locator($"button:text-is('{amount}')");
            await Expect(btn).ToBeVisibleAsync();
        }
    }

    [Test]
    public async Task Settings_Wallet_TopUpModal_ShouldDisplayCustomAmountInput()
    {
        await Page.Locator("button:has-text('Wallet')").ClickAsync();
        await Page.Locator("button:has-text('Top Up')").ClickAsync();

        var customInput = Page.Locator("input[placeholder='Custom amount']");
        await Expect(customInput).ToBeVisibleAsync();
    }

    [Test]
    public async Task Settings_Wallet_TopUpModal_ShouldDisplayContinueButton()
    {
        await Page.Locator("button:has-text('Wallet')").ClickAsync();
        await Page.Locator("button:has-text('Top Up')").ClickAsync();

        var continueBtn = Page.Locator("button:has-text('Continue to Payment')");
        await Expect(continueBtn).ToBeVisibleAsync();
    }

    [Test]
    public async Task Settings_Wallet_TopUpModal_ShouldRejectBelowMinimum()
    {
        await Page.Locator("button:has-text('Wallet')").ClickAsync();
        await Page.Locator("button:has-text('Top Up')").ClickAsync();

        var customInput = Page.Locator("input[placeholder='Custom amount']");
        await customInput.FillAsync("0.50");
        await Page.Locator("button:has-text('Continue to Payment')").ClickAsync();

        var error = Page.Locator("text=Minimum top-up is $1.00");
        await Expect(error).ToBeVisibleAsync();
    }

    // ── Linked Accounts section ─────────────────────────────────────────────────

    [Test]
    public async Task Settings_LinkedAccounts_ShouldDisplaySteamCard()
    {
        await Page.Locator("button:has-text('Linked Accounts')").ClickAsync();
        var steamTitle = Page.GetByText("Steam Account", new() { Exact = true });
        await Expect(steamTitle).ToBeVisibleAsync();
    }

    [Test]
    public async Task Settings_LinkedAccounts_ShouldDisplayConnectButton()
    {
        await Page.Locator("button:has-text('Linked Accounts')").ClickAsync();
        var connectBtn = Page.Locator("button:has-text('Connect')");
        await Expect(connectBtn).ToBeVisibleAsync();
    }

    // ── Notifications section ───────────────────────────────────────────────────

    [Test]
    public async Task Settings_Notifications_ShouldDisplayToggleSwitches()
    {
        await Page.Locator("button:has-text('Notifications')").ClickAsync();
        var switches = Page.Locator("button[role='switch']");
        var count = await switches.CountAsync();
        Assert.That(count, Is.GreaterThan(0));
    }

    [Test]
    public async Task Settings_Notifications_ToggleSwitch_ShouldChangeState()
    {
        await Page.Locator("button:has-text('Notifications')").ClickAsync();

        var firstSwitch = Page.Locator("button[role='switch']").First;
        var checkedBefore = await firstSwitch.GetAttributeAsync("aria-checked");

        await firstSwitch.ClickAsync();

        var checkedAfter = await firstSwitch.GetAttributeAsync("aria-checked");
        Assert.That(checkedAfter, Is.Not.EqualTo(checkedBefore));
    }

    // ── Privacy section ─────────────────────────────────────────────────────────

    [Test]
    public async Task Settings_Privacy_ShouldDisplayProfileVisibilityToggle()
    {
        await Page.Locator("button:has-text('Privacy')").ClickAsync();
        var publicProfile = Page.GetByText("Public profile", new() { Exact = true });
        await Expect(publicProfile).ToBeVisibleAsync();
    }

    [Test]
    public async Task Settings_Privacy_ShouldDisplayExportDataButton()
    {
        await Page.Locator("button:has-text('Privacy')").ClickAsync();
        var exportBtn = Page.Locator("button:text-is('Export')");
        await Expect(exportBtn).ToBeVisibleAsync();
    }

    // ── Navigation ──────────────────────────────────────────────────────────────

    [Test]
    public async Task SettingsPage_ShouldBeAccessibleFromUserMenu()
    {
        await GoToAsync(TestSettings.BaseUrl);
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);

        await Page.Locator("button[aria-label='User menu']").ClickAsync();
        await Page.Locator("header a[href='/settings']").ClickAsync();
        await Page.WaitForURLAsync("**/settings", new() { WaitUntil = WaitUntilState.DOMContentLoaded });

        Assert.That(Page.Url, Does.Contain("/settings"));
    }
}
