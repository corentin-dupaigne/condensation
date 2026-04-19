using Microsoft.Playwright;

namespace Condensation.E2E.Tests.Pages.Components;

public class FooterComponent
{
    private readonly IPage _page;

    private ILocator FooterElement =>
        _page.Locator("body > footer, footer:not([data-nextjs-error-overlay-footer])").First;
    private ILocator CopyrightText => FooterElement.Locator("p:has-text('Condensation')");

    public FooterComponent(IPage page)
    {
        _page = page;
    }

    public ILocator FooterLink(string text) =>
        FooterElement.Locator($"a:has-text('{text}')");

    public async Task<bool> IsVisibleAsync()
    {
        await FooterElement.WaitForAsync(new LocatorWaitForOptions
        {
            State = WaitForSelectorState.Visible,
        });
        return true;
    }

    public async Task<string> GetCopyrightTextAsync() => await CopyrightText.InnerTextAsync();

    public async Task ClickLinkAsync(string text) => await FooterLink(text).ClickAsync();
}
