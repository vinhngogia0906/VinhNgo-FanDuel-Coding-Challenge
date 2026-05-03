# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# syntax=docker/dockerfile:1.7

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csprojs first for layer caching
COPY ["FanDuelDepthChartEngine.Domain/FanDuelDepthChartEngine.Domain.csproj",                 "FanDuelDepthChartEngine.Domain/"]
COPY ["FanDuelDepthChartEngine.Application/FanDuelDepthChartEngine.Application.csproj",       "FanDuelDepthChartEngine.Application/"]
COPY ["FanDuelDepthChartEngine.Infrastructure/FanDuelDepthChartEngine.Infrastructure.csproj", "FanDuelDepthChartEngine.Infrastructure/"]
COPY ["FanDuelDepthChartEngine.Api/FanDuelDepthChartEngine.Api.csproj",                       "FanDuelDepthChartEngine.Api/"]

RUN dotnet restore "./FanDuelDepthChartEngine.Api/FanDuelDepthChartEngine.Api.csproj"

# Now copy the rest and publish
COPY . .
RUN dotnet publish "FanDuelDepthChartEngine.Api/FanDuelDepthChartEngine.Api.csproj" \
    -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Run as non-root
USER $APP_UID

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://+:8080 \
    DOTNET_RUNNING_IN_CONTAINER=true

EXPOSE 8080

ENTRYPOINT ["dotnet", "FanDuelDepthChartEngine.Api.dll"]
