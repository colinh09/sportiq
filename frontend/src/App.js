import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
    const [data, setData] = useState(null);

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/api/data')
            .then(response => setData(response.data.message))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div>
            <h1>React + Flask Example</h1>
            <p>{data || 'Loading...'}</p>
        </div>
    );
}

export default App;
