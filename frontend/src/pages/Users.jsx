import { useState, useEffect } from "react";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/users"
        );
        if (!response.ok) throw new Error("Network error");

        const data = await response.json(); // gets array of 10 users
        setUsers(data); // update state
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2>User Details</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            👤 <strong>{u.name}</strong> – {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
