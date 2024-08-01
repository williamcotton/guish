curl -s 'https://jsonplaceholder.typicode.com/todos' | nodejsx "const todos = JSON.parse(STDIN);
const Todo = ({ title, completed }) => (
  <div style={{ margin: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: completed ? '#dff0d8' : '#f2dede' }}>
    {title} - {completed ? 'Completed' : 'Not Completed'}
  </div>
);
const App = () => {
  const todoElements = todos.map(todo => (
    <Todo key={todo.id} title={todo.title} completed={todo.completed} />
  ));
  return <div>{todoElements}</div>;
};
"