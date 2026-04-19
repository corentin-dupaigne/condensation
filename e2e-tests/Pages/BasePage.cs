using Microsoft.Playwright;
using Condensation.E2E.Tests.Config;
using Condensation.E2E.Tests.Pages.Components;

namespace Condensation.E2E.Tests.Pages;

public abstract class BasePage
{
    protected readonly IPage Page;
    public HeaderComponent Header { get; }
    public FooterComponent Footer { get; }

    protected string BaseUrl => TestSettings.BaseUrl;

    protected BasePage(IPage page)
    {
        Page = page;
        Header = new HeaderComponent(page);
        Footer = new FooterComponent(page);
    }

    protected abstract string PagePath { get; }

    public async Task NavigateAsync()
    {
        await Page.GotoAsync($"{BaseUrl}{PagePath}", new PageGotoOptions
        {
            WaitUntil = WaitUntilState.DOMContentLoaded,
        });
        // Best-effort Load wait so React hydrates before interactions; Next.js dev may
        // never fire `load` for pages with long-lived HMR sockets, so we tolerate timeout.
        try { await Page.WaitForLoadStateAsync(LoadState.Load, new() { Timeout = 5_000 }); }
        catch (TimeoutException) { }
    }

    public async Task<string> GetTitleAsync() => await Page.TitleAsync();

    public async Task<string> GetCurrentUrlAsync() => Page.Url;
}
