pg -d test_database -c 'select * from test_table' | tsvtohtml | prependcss -c 'table {
    width: 80%;
    border-collapse: collapse;
    margin: 20px auto;
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    background-color: #ffffff;
}

th, td {
    padding: 12px 15px;
    border: 1px solid #dddddd;
    text-align: left;
}

th {
    background-color: #f2f2f2;
    color: #333333;
    font-size: 16px;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

tr:hover {
    background-color: #f1f1f1;
}

caption {
    padding: 10px;
    font-size: 20px;
    font-weight: bold;
}
'