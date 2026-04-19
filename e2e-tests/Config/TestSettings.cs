namespace Condensation.E2E.Tests.Config;

public static class TestSettings
{
    public static string BaseUrl =>
        Environment.GetEnvironmentVariable("E2E_BASE_URL") ?? "http://localhost:4000";

    public static int DefaultTimeout =>
        int.TryParse(Environment.GetEnvironmentVariable("E2E_TIMEOUT"), out var t) ? t : 15000;

    public static string TestUserEmail =>
        Environment.GetEnvironmentVariable("E2E_TEST_EMAIL") ?? "test@example.com";

    public static string TestUserPassword =>
        Environment.GetEnvironmentVariable("E2E_TEST_PASSWORD") ?? "password";
}
