curl -s 'https://api.open-meteo.com/v1/forecast?latitude=30.27&longitude=-97.74&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m' |
  jq -r '.hourly |
    ["time", "temperature_2m", "relative_humidity_2m", "wind_speed_10m"],
    ([.time, .temperature_2m, .relative_humidity_2m, .wind_speed_10m] | transpose[]) |
    @csv' |
  ggplot 'df_long <- pivot_longer(df, cols = c("temperature_2m", "relative_humidity_2m", "wind_speed_10m"),
                          names_to = "variable", values_to = "value")

# Rename the variables for better legibility

df_long$variable[df_long$variable == "temperature_2m"] <- "Temperature (°C)"

df_long$variable[df_long$variable == "relative_humidity_2m"] <- "Humidity (%)"

df_long$variable[df_long$variable == "wind_speed_10m"] <- "Wind (m/s)"

# Plot the data with facets as rows

 ggplot(df_long, aes(x = time, y = value, color = variable)) +
    geom_line() +
    facet_wrap(~ variable, scales = "free_y", nrow = 3) +
    labs(title = "Weather Data in Austin, TX", x = "Time", y = "Value") +
    scale_x_datetime(date_breaks = "1 day", date_labels = "%b %d") +
    theme_minimal()' |
  pngcopyhtml