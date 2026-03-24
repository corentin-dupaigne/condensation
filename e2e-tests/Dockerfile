FROM mcr.microsoft.com/dotnet/sdk:10.0

WORKDIR /src
COPY Condensation.E2E.Tests.csproj .
RUN dotnet restore

COPY . .
RUN dotnet build -c Release

# Install Playwright chromium browser and its OS dependencies
RUN ./bin/Release/net10.0/.playwright/node/linux-x64/node \
    ./bin/Release/net10.0/.playwright/package/cli.js install --with-deps chromium

ENTRYPOINT ["dotnet", "test", "-c", "Release", "--no-build", "--logger", "console;verbosity=detailed"]
