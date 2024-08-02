tablecho 'month,debit,credit
1,300,200
2,399,232
3,234,253' | awk -F, 'BEGIN {
    OFS = ","
    print "month,debit,credit,balance"
}
NR > 1 { 
    balance = $2 - $3 
    total_debit += $2
    total_credit += $3
    print $1, $2, $3, balance
} 
END { 
    print "total", total_debit, total_credit, total_debit - total_credit
}' | ggplot 'ggplot(df, aes(month, balance)) +
    geom_col(fill = "red") +
    theme_minimal()' | pngtohtml