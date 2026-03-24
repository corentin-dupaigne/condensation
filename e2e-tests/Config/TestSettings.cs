namespace Condensation.E2E.Tests.Config;

public static class TestSettings
{
    public static string BaseUrl =>
        Environment.GetEnvironmentVariable("E2E_BASE_URL") ?? "http://localhost:4000";

    public static int DefaultTimeout =>
        int.TryParse(Environment.GetEnvironmentVariable("E2E_TIMEOUT"), out var t) ? t : 30000;
}
