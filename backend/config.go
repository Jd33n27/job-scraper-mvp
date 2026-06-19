package main

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL       string
	DiscordWebhookURL string
	ScraperServiceURL string
	Port              string
	UserName          string
	UserEmail         string
	UserPhone         string
	GeminiAPIKey      string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: No .env file found, using environment variables")
	}

	return &Config{
		DatabaseURL:       getEnv("DATABASE_URL", ""),
		DiscordWebhookURL: getEnv("DISCORD_WEBHOOK_URL", ""),
		ScraperServiceURL: getEnv("SCRAPER_SERVICE_URL", "http://localhost:3001"),
		Port:              getEnv("PORT", "8080"),
		UserName:          getEnv("USER_NAME", "Default Name"),
		UserEmail:         getEnv("USER_EMAIL", "default@example.com"),
		UserPhone:         getEnv("USER_PHONE", "0000000000"),
		GeminiAPIKey:      getEnv("GEMINI_API_KEY", ""),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return strings.TrimSpace(value)
	}
	return strings.TrimSpace(fallback)
}
