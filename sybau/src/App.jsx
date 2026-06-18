import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

import ToDoForm from './AddTask';
import ToDo from './Task';

const weatherApiKey = 'c7616da4b68205c2f3ae73df2c31d177';
const TASKS_STORAGE_KEY = 'tasks-list-project-web';

function App() {
  const [rates, setRates] = useState({});
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todos, setTodos] = useState(() => {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        return Array.isArray(parsedTasks) ? parsedTasks : [];
      } catch (e) {
        console.error('Ошибка при чтении задач из localStorage');
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    async function fetchAllData() {
      try {
        const currencyResponse = await axios.get('https://www.cbr-xml-daily.ru/daily_json.js');

        if (!currencyResponse.data?.Valute) {
          throw new Error('Нет данных о валюте');
        }

        const USDrate = currencyResponse.data.Valute.USD.Value
          .toFixed(4)
          .replace('.', ',');

        const EURrate = currencyResponse.data.Valute.EUR.Value
          .toFixed(4)
          .replace('.', ',');

        setRates({ USD: USDrate, EUR: EURrate });

        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`
        );

        if (!weatherResponse.data?.main) {
          throw new Error('Нет данных о погоде');
        }

        setWeatherData(weatherResponse.data);

      } catch (err) {
        console.error(err);
        setError(err.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  const addTask = (userInput) => {
    if (userInput.trim() === '') return;
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      task: userInput,
      complete: false
    };
    setTodos([...todos, newItem]);
  };

  const removeTask = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleToggle = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, complete: !todo.complete } : todo
    ));
  };

  return (
    <div className="App">
      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <div className="info">
            <div id="USD">Доллар США $ — {rates.USD} ₽</div>
            <div id="EUR">Евро € — {rates.EUR} ₽</div>
          </div>

          {weatherData && (
            <div className="weather-info">
              <h3>Погода сегодня:</h3>
              <p>
                {(weatherData.main.temp - 273.15).toFixed(1)}°C •{' '}
                {weatherData.wind.speed} м/с •{' '}
                {weatherData.clouds.all}% облачности
              </p>
              <img
                className="weather-icon"
                src={`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`}
                alt="Иконка погоды"
              />
            </div>
          )}

          <header>
            <h1 className="list-header">Список задач: {todos.length}</h1>
          </header>

          <ToDoForm addTask={addTask} />

          <div className="todos">
            {todos.map(todo => (
              <ToDo
                key={todo.id}
                todo={todo}
                toggleTask={handleToggle}
                removeTask={removeTask}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;