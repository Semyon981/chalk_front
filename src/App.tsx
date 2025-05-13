import React from 'react';
import './App.css';
import './styles/colors.css'

const App: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика входа
    console.log('Форма отправлена');
  };

  return (
    <div className="app-container">
      <div className="left-section">
        <div className="content">
          <h1 className="title">ChalkHub</h1>
          <p className="subtitle">
            Современная система управления образовательными курсами для преподавателей и студентов
          </p>
          <div className="features">
            <p>✓ Простое создание и управление курсами</p>
            <p>✓ Удобное взаимодействие с учащимися</p>
            <p>✓ Аналитика успеваемости</p>
          </div>
        </div>
      </div>
      <div className="right-section">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Вход</h2>
          <div className="form-group">
            <input
              type="email"
              id="email"
              placeholder="Введите email"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              placeholder="Введите пароль"
              required
            />
          </div>
          <button type="submit" className="login-button">Войти</button>
          <div className="links">
            <a href="/forgot-password">Забыли пароль?</a>
            <a href="/register">Регистрация</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
