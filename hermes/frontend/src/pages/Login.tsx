export default function Login() {
  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Login</h1>
      <form>
        <div>
          <label>Email: <input type="email" /></label>
        </div>
        <div>
          <label>Password: <input type="password" /></label>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
