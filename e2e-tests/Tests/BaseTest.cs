using NUnit.Framework;
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;
using Condensation.E2E.Tests.Config;

namespace Condensation.E2E.Tests.Tests;

public class BaseTest : PageTest
{
    public override BrowserNewContextOptions ContextOptions()
    {
        return new BrowserNewContextOptions
        {
            BaseURL = TestSettings.BaseUrl,
            ViewportSize = new ViewportSize { Width = 1920, Height = 1080 },
            IgnoreHTTPSErrors = true
        };
    }

    [SetUp]
    public async Task BaseSetUp()
    {
        Page.SetDefaultTimeout(TestSettings.DefaultTimeout);
    }
}
