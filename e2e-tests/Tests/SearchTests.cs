using NUnit.Framework;
using Condensation.E2E.Tests.Pages;

namespace Condensation.E2E.Tests.Tests;

[TestFixture]
public class SearchTests : BaseTest
{
    private SearchPage _searchPage = null!;

    [SetUp]
    public async Task SetUp()
    {
        _searchPage = new SearchPage(Page);
    }

    [Test]
    public async Task SearchPage_ShouldLoadSuccessfully()
    {
        await _searchPage.NavigateAsync();
        var title = await _searchPage.GetTitleAsync();
        Assert.That(title, Is.Not.Empty);
    }

    [Test]
    public async Task SearchPage_WithQuery_ShouldDisplayResults()
    {
        await _searchPage.NavigateWithQueryAsync("counter-strike");
        var count = await _searchPage.GetResultCardCountAsync();
        Assert.That(count, Is.GreaterThan(0));
    }

    [Test]
    public async Task SearchPage_WithInvalidQuery_ShouldShowNoResults()
    {
        await _searchPage.NavigateWithQueryAsync("xyznonexistentgame12345");
        var isNoResults = await _searchPage.IsNoResultsVisibleAsync();
        Assert.That(isNoResults, Is.True);
    }

    [Test]
    public async Task SearchPage_WithoutQuery_ShouldShowPopularSearches()
    {
        await _searchPage.NavigateAsync();
        var count = await _searchPage.GetPopularSearchCountAsync();
        Assert.That(count, Is.GreaterThan(0));
    }

    [Test]
    public async Task SearchPage_ShouldDisplayHeader()
    {
        await _searchPage.NavigateAsync();
        var isVisible = await _searchPage.Header.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }

    [Test]
    public async Task SearchPage_ShouldDisplayFooter()
    {
        await _searchPage.NavigateAsync();
        var isVisible = await _searchPage.Footer.IsVisibleAsync();
        Assert.That(isVisible, Is.True);
    }
}
