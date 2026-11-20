
import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedRoles, setSelectedRoles] = useState({});

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load users and current administrator
  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        const [usersResponse, meResponse] =
          await Promise.all([
            api.get("/users"),
            api.get("/users/me"),
          ]);

        if (!cancelled) {
          const loadedUsers = usersResponse.data;

          setUsers(loadedUsers);
          setCurrentUser(meResponse.data);

          const roles = {};

          loadedUsers.forEach((user) => {
            roles[user.id] = user.role;
          });

          setSelectedRoles(roles);
        }
      } catch (err) {
        console.error("Failed to load users:", err);

        if (!cancelled) {
          if (err.response?.status === 403) {
            setError("Administrator permission is required.");
          } else if (err.response?.status === 401) {
            setError("Please login as an administrator.");
          } else {
            setError("Failed to load users.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [refreshCount]);

  // Change selected role in the dropdown
  function handleRoleSelection(userId, newRole) {
    setSelectedRoles((previous) => ({
      ...previous,
      [userId]: newRole,
    }));
  }

  // Save role to the backend
  async function handleChangeRole(user) {
    const newRole = selectedRoles[user.id];

    if (!newRole || newRole === user.role) {
      return;
    }

    if (user.id === currentUser?.id) {
      setError("You cannot change your own role.");
      return;
    }

    const confirmed = window.confirm(
      `Change ${user.email} from ${user.role} to ${newRole}?`
    );

    if (!confirmed) {
      return;
    }

    setSavingId(user.id);
    setError("");
    setMessage("");

    try {
      // Obtain CSRF token
      await api.get("/auth/csrf");

      const response = await api.patch(
        `/users/${user.id}/role`,
        {
          role: newRole,
        }
      );

      const updatedUser = response.data;

      // Update the table without reloading
      setUsers((previous) =>
        previous.map((existingUser) =>
          existingUser.id === updatedUser.id
            ? updatedUser
            : existingUser
        )
      );

      setSelectedRoles((previous) => ({
        ...previous,
        [updatedUser.id]: updatedUser.role,
      }));

      setMessage(
        `Role updated successfully for ${updatedUser.email}.`
      );
    } catch (err) {
      console.error("Failed to change role:", err);

      setError(
        err.response?.data?.detail ||
        "Failed to change user role."
      );
    } finally {
      setSavingId(null);
    }
  }

  // Reload users
  function handleRefresh() {
    setError("");
    setMessage("");
    setLoading(true);
    setRefreshCount((count) => count + 1);
  }

  // Filter users by name or email
  const searchText = search.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    const fullName =
      `${user.firstName} ${user.lastName}`.toLowerCase();

    return (
      fullName.includes(searchText) ||
      user.email.toLowerCase().includes(searchText)
    );
  });

  const totalCustomers = users.filter(
    (user) => user.role === "CUSTOMER"
  ).length;

  const totalAdmins = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">

      {/* Header */}
      <Link
        to="/admin"
        className="text-teal-700 hover:underline"
      >
        ← Admin Dashboard
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Manage Users
          </h1>

          <p className="mt-2 text-gray-600">
            View registered users and manage their roles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading || savingId !== null}
          className="rounded-lg border border-gray-300 bg-white px-5 py-3 hover:bg-gray-100 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid gap-5 sm:grid-cols-3">

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-gray-500">
            Total Users
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            {users.length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-gray-500">
            Customers
          </p>

          <h2 className="mt-3 text-3xl font-bold text-teal-700">
            {totalCustomers}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-gray-500">
            Administrators
          </p>

          <h2 className="mt-3 text-3xl font-bold text-blue-700">
            {totalAdmins}
          </h2>
        </div>
      </div>

      {/* Success Message */}
      {message && (
        <p
          role="status"
          className="mt-6 rounded-lg bg-green-50 p-4 text-green-700"
        >
          {message}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {/* Search */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
        <label
          htmlFor="user-search"
          className="mb-2 block font-medium"
        >
          Search Users
        </label>

        <input
          id="user-search"
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by name or email..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
      </div>

      {/* Users Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">

        <table className="w-full text-left text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">User</th>
              <th className="p-4">Current Role</th>
              <th className="p-4">Change Role</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center"
                >
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isCurrentUser =
                  user.id === currentUser?.id;

                const selectedRole =
                  selectedRoles[user.id] ?? user.role;

                const hasChanged =
                  selectedRole !== user.role;

                return (
                  <tr
                    key={user.id}
                    className="border-t border-gray-200"
                  >
                    {/* ID */}
                    <td className="p-4">
                      #{user.id}
                    </td>

                    {/* User Information */}
                    <td className="p-4">
                      <p className="font-semibold">
                        {user.firstName} {user.lastName}
                      </p>

                      <p className="mt-1 text-gray-500">
                        {user.email}
                      </p>

                      {user.phone && (
                        <p className="mt-1 text-gray-500">
                          {user.phone}
                        </p>
                      )}

                      {isCurrentUser && (
                        <span className="mt-2 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                          Your Account
                        </span>
                      )}
                    </td>

                    {/* Current Role */}
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-2 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Role Selection */}
                    <td className="p-4">
                      <select
                        aria-label={`Role for ${user.email}`}
                        value={selectedRole}
                        onChange={(event) =>
                          handleRoleSelection(
                            user.id,
                            event.target.value
                          )
                        }
                        disabled={
                          isCurrentUser ||
                          savingId !== null
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 disabled:opacity-50"
                      >
                        <option value="CUSTOMER">
                          Customer
                        </option>

                        <option value="ADMIN">
                          Administrator
                        </option>
                      </select>
                    </td>

                    {/* Save Button */}
                    <td className="p-4">
                      {isCurrentUser ? (
                        <span className="text-xs text-gray-500">
                          Not allowed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleChangeRole(user)
                          }
                          disabled={
                            !hasChanged ||
                            savingId !== null
                          }
                          className="rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {savingId === user.id
                            ? "Saving..."
                            : "Save Role"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Information */}
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-semibold text-amber-900">
          Important: Role Management
        </h2>

        <p className="mt-2 text-sm text-amber-800">
          Administrator roles provide access to sensitive
          bookstore management features. Only grant this
          role to trusted users.
        </p>

        <p className="mt-2 text-sm text-amber-800">
          Users may need to log in again before their
          new permissions take effect.
        </p>
      </div>

    </section>
  );
}
