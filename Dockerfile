FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/HrManager.API/HrManager.API.csproj ./HrManager.API/
RUN dotnet restore ./HrManager.API/
COPY backend/HrManager.API/ ./HrManager.API/
RUN dotnet publish ./HrManager.API/ -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY --from=frontend-build /frontend/dist ./wwwroot
ENTRYPOINT ["dotnet", "HrManager.API.dll"]
