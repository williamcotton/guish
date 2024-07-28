echo 'one
two
three' | node -e "let inputData = '';
process.stdin.on('data', 
    chunk => inputData += chunk
);
process.stdin.on('end',
    () => console.log(inputData.toUpperCase())
);"