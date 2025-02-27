import { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  padding: 20px;
`;

const SERVER_URL = 'http://localhost:3001/api/todo';

const Test = () => {
    const [todo, setTodo] = useState(null);

    const fetchData = async () => {
        const response = await axios.get(SERVER_URL);
        setTodo(response.data);

        // axios
        // axios.get('http://localhost:3001/api/todo')
        // .then(res => {
        //     setTodo(res.data);
        // });

        // fetch
        // fetch('http://localhost:3001/api/todo')
        // .then(res => res.json())
        // .then(data => {
        //     setTodo(data);
        // });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        const title = e.target.title.value;
        const done = e.target.done.checked;

        axios.post(SERVER_URL, {
            title,
            done,
        });
        fetchData();

        // fetch('http://localhost:3001/api/todo', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         title,
        //         done,
        //     }),
        // }).then(() => {
        //     fetchData();
        // })
    };

    return (
        <Container>
            <h1>Test Component</h1>
            <form onSubmit={onSubmit}>
                <input type="text"  name="title" />
                <input type="checkbox" name="done" />
                <input type="submit" value="Submit" />
            </form>
            {todo?.map((item) => (
                <div key={item.id}>
                    <div>{item.id}</div>
                    <div>{item.title}</div>
                    <div>{item.done ? 'true' : 'false'}</div>
                </div>
            ))}
        </Container>
    );
};

export default Test;