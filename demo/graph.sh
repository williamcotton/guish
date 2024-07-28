pg -d test_database -c 'SELECT * FROM test_table' | tsvtocsv | ggplot 'ggplot(df, aes(as.Date(date), value)) +
    geom_col(fill = "red") +
    theme_minimal() +
    labs(x = "Date", y = "Value")' | pngcopyhtml