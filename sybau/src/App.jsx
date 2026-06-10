import React, { useState, useEffect} from 'react'
import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import axios from 'axios'

const weatherApiKey = 'c7616da4b68205c2f3ae73df2c31d177';

useEffect(() => {
  async function fetchAllData() {
    try {
      const currencyResponse = await axios.get(
        'https://www.cbr-xml-daily.ru/daily_json.js'
      );

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

  fetchAllData(); // ← важно вызвать функцию!

}, []); // пустой массив зависимостей

  return (
  <div className="App">
    {/* Состояние загрузки */}
    {loading && <p>Загрузка...</p>}

    {/* Ошибка */}
    {error && <p style={{ color: 'red' }}>{error}</p>}

    {/* Основной контент — показываем только если нет ошибки и загрузка завершена */}
    {!loading && !error && (
      <>
        {/* Блок с курсами валют */}
        <div className="money">
          <div id="USD">
            Доллар США ${rates.USD} ₽
          </div>
          <div id="EUR">
            Евро € {rates.EUR} ₽
          </div>
        </div>

        {/* Блок с погодой */}
        {weatherData && (
          <div className="weather-info">
            <div className="weather-today">
              Погода сегодня: <br />
              {(weatherData.main.temp - 273.15).toFixed(1)}°C •{' '}
              {weatherData.wind.speed} м/с •{' '}
              {weatherData.clouds.all}% облачности
            </div>
            <img 
              className="weather-icon"
              src={`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`} 
              alt="Иконка погоды" 
            />
          </div>
        )}

        {/* Заголовок списка задач */}
        <header>
          <h1 className="list-header">
            Список задач: {todos.length}
          </h1>
        </header>

        {/* Форма добавления задачи */}
        <TodoForm addTask={addTask} />

        {/* Список задач */}
        <div className="todos">
          {todos.map((todo) => (
            <Todo
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

export default App
