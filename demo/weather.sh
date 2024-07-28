curl -s 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m' | jq -r '.hourly | 
  ["time", "temperature_2m", "relative_humidity_2m", "wind_speed_10m"],
  ([.time, .temperature_2m, .relative_humidity_2m, .wind_speed_10m] | transpose[]) | 
  @csv' | ggplot 'df_long <- pivot_longer(df, cols = c("temperature_2m", "relative_humidity_2m", "wind_speed_10m"), 
                        names_to = "variable", values_to = "value")

# Plot the data
ggplot(df_long, aes(x = time, y = value, color = variable)) +
  geom_line() +
  labs(title = "Weather Data", x = "Time", y = "Value") +
  theme_minimal()' | pngcopyhtml