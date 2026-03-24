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
        await Page.GotoAsync($"{BaseUrl}{PagePath}");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);
    }

    public async Task<string> GetTitleAsync() => await Page.TitleAsync();

    public async Task<string> GetCurrentUrlAsync() => Page.Url;

    public async Task WaitForPageLoadAsync()
    {
        await Page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
    }

    public async Task ScreenshotAsync(string path)
    {
        await Page.ScreenshotAsync(new PageScreenshotOptions { Path = path, FullPage = true });
    }
}
