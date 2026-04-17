using Microsoft.Playwright;

namespace Condensation.E2E.Tests.Pages.Components;

public class FooterComponent
{
    private readonly IPage _page;

    private ILocator FooterElement => _page.Locator("footer").Last;
    private ILocator CopyrightText => FooterElement.Locator("p:has-text('Condensation')");

    public FooterComponent(IPage page)
    {
        _page = page;
    }

    public ILocator FooterLink(string text) =>
        FooterElement.Locator($"a:has-text('{text}')");

    public async Task<bool> IsVisibleAsync()
    {
        try
        {
            // Wait for the footer to be attached to the DOM first
            await FooterElement.WaitForAsync(new LocatorWaitForOptions
            {
                State = WaitForSelectorState.Attached,
                Timeout = 15_000
            });
            // Then scroll it into view so Playwright considers it visible
            await FooterElement.ScrollIntoViewIfNeededAsync();
            return await FooterElement.IsVisibleAsync();
        }
        catch
        {
            return false;
        }
    }

    public async Task<string> GetCopyrightTextAsync() => await CopyrightText.InnerTextAsync();

    public async Task ClickLinkAsync(string text) => await FooterLink(text).ClickAsync();
}
