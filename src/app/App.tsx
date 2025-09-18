import { useEffect, useState } from 'react';
import type { Schema } from '../../amplify/data/resource';
import { signOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { useAuth } from '@features/auth';

const client = generateClient<Schema>();

export function App() {
	const { user } = useAuth();
	const [todos, setTodos] = useState<Array<Schema['Todo']['type']>>([]);

	useEffect(() => {
		const sub = client.models.Todo.observeQuery().subscribe({
			next: (data) => setTodos([...data.items]),
		});
		return () => sub.unsubscribe();
	}, []);

	function createTodo() {
		client.models.Todo.create({ content: window.prompt('Todo content') });
	}

	function deleteTodo(id: string) {
		client.models.Todo.delete({ id });
	}
	const userEmail = user?.signInDetails?.loginId || user?.username || 'Unknown';

	return (
		<main>
			<h1>Hi, welcome to Metamatic {userEmail}</h1>
			<button onClick={() => signOut().then(() => window.location.reload())}>Log Out</button>

			<div style={{ marginTop: '40px' }}>
				<h2>Your Todos</h2>
				<button onClick={createTodo}>+ new</button>
				<ul>
					{todos.map((todo) => (
						<li onClick={() => deleteTodo(todo.id)} key={todo.id}>
							{todo.content}
						</li>
					))}
				</ul>
			</div>
		</main>
	);
}

export default App;