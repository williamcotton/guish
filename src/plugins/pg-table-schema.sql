SELECT 
    t.table_schema,
    t.table_name,
    c.column_name,
    c.data_type
FROM 
    (SELECT table_schema, table_name
     FROM information_schema.tables
     WHERE table_type = 'BASE TABLE' 
     AND table_schema NOT IN ('pg_catalog', 'information_schema')
    ) AS t
JOIN 
    information_schema.columns AS c 
ON 
    t.table_schema = c.table_schema 
    AND t.table_name = c.table_name
ORDER BY 
    t.table_schema, t.table_name, c.ordinal_position;
