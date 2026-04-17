using NUnit.Framework;

namespace Condensation.E2E.Tests.Tests;

/// <summary>
/// Base class for tests that require an authenticated user session.
/// Automatically logs in before each test via the full OAuth/PKCE flow.
/// </summary>
public class AuthenticatedBaseTest : BaseTest
{
    [SetUp]
    public async Task AuthenticatedSetUp()
    {
        await LoginAsync();
    }
}
