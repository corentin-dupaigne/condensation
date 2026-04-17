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
            // Wait for the footer to be attached and visible (non-empty bbox, not display:none).
            // Avoid ScrollIntoViewIfNeeded: on long pages with animations/lazy images it can
            // time out even though the footer itself is rendered and visible.
            await FooterElement.WaitForAsync(new LocatorWaitForOptions
            {
                State = WaitForSelectorState.Visible,
                Timeout = 15_000
            });
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<string> GetCopyrightTextAsync() => await CopyrightText.InnerTextAsync();

    public async Task ClickLinkAsync(string text) => await FooterLink(text).ClickAsync();
}
