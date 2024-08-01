curl -s 'https://jsonplaceholder.typicode.com/todos/1' | node -e "const React = require('react');
const ReactDOMServer = require('react-dom/server');

const STDIN = require('fs').readFileSync(0).toString();
const todo = JSON.parse(STDIN);

const Todo = () => React.createElement('div', null, todo.title + ' - ' + (todo.completed ? 'Completed' : 'Not Completed'));
const htmlString = ReactDOMServer.renderToString(React.createElement(Todo));
console.log(htmlString);"