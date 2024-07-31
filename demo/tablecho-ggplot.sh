tablecho 'month,debit,credit
1,300,200
2,399,232
3,234,253' | ggplot 'df$balance <- df$debit - df$credit
total_row <- data.frame(
    month = "Total", 
    debit = sum(df$debit), 
    credit = sum(df$credit), 
    balance = sum(df$debit) - sum(df$credit)
)
df <- rbind(df, total_row)
ggplot(df, aes(x = month, y = balance)) + 
    geom_col(fill = "red") + 
    theme_minimal()' | pngcopyhtml