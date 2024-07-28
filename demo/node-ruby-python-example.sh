echo "one
two
three" | node -e "let inputData = '';
process.stdin.on('data', 
    chunk => inputData += chunk
);
process.stdin.on('end',
    () => console.log(inputData.toUpperCase())
);" | ruby -e 'puts $stdin.read.downcase' | python -c 'import sys
sys.stdout.write(
    sys.stdin.read().upper()
)' | fsharp 'open System

let input = Console.In.ReadToEnd()
let lowercase = input.ToLower()
printfn "%s" lowercase'