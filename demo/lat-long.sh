curl -s 'https://jsonplaceholder.typicode.com/users' | jq -r '.[] | .name + "," + .address.geo.lat + "," + .address.geo.lng' | awk -F, 'BEGIN { print "name,lat,lon" }
{ print }' | ggplot 'library(ggmap)

key <- Sys.getenv("GOOGLE_API_KEY")
register_google(key = key)

US <- get_map("United States", zoom=2)

ggmap(US) + 
    geom_point(data=df, aes(x=lon, y=lat),size=0.2, color = "blue") +
    geom_text(data=df, aes(x=lon, y=lat, label=name), vjust=-0.1, hjust=-0.1, color="blue", size=1)' | pngtohtml