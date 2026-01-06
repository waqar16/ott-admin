"use client";
import { useState } from "react";

export default function CreateUserPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    subscription: "",
  });

  const [errors, setErrors] = useState<any>({});

  // Validation function
  const validate = () => {
    let temp: any = {};

    if (!form.name.trim()) temp.name = "Full name is required.";
    if (!form.email.trim()) temp.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      temp.email = "Invalid email format.";

    if (!form.password.trim()) temp.password = "Password is required.";
    else if (form.password.length < 6)
      temp.password = "Password must be at least 6 characters.";

    if (!form.role) temp.role = "Please select a role.";
    if (!form.subscription) temp.subscription = "Please select subscription.";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const submitForm = (e: any) => {
    e.preventDefault();

    if (!validate()) return;

    console.log("Form submitted:", form);
    alert("User created successfully!");
  };

  return (
    <div className="p-6 w-full mx-auto text-white bg-gray-900">
      <h1 className="text-3xl font-bold mb-2">Create New User</h1>
      <p className="text-gray-400 mb-6">Fill details to create a new user.</p>

      <form
        onSubmit={submitForm}
        className="space-y-6 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl"
      >
        {/* Name */}
        <div>
          <label className="block mb-1 text-gray-300">Full Name</label>
          <input
            type="text"
            className="w-full p-3 bg-gray-700 rounded-lg outline-none border border-gray-600 focus:border-blue-500"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 text-gray-300">Email Address</label>
          <input
            type="email"
            className="w-full p-3 bg-gray-700 rounded-lg outline-none border border-gray-600 focus:border-blue-500"
            placeholder="example@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 text-gray-300">Password</label>
          <input
            type="password"
            className="w-full p-3 bg-gray-700 rounded-lg outline-none border border-gray-600 focus:border-blue-500"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block mb-1 text-gray-300">User Role</label>
          <select
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="">Select role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {errors.role && (
            <p className="text-red-400 text-sm mt-1">{errors.role}</p>
          )}
        </div>

        {/* Subscription */}
        <div>
          <label className="block mb-1 text-gray-300">Subscription</label>
          <select
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500"
            value={form.subscription}
            onChange={(e) =>
              setForm({ ...form, subscription: e.target.value })
            }
          >
            <option value="">Select subscription</option>
            <option value="Free">Free</option>
            <option value="Premium">Premium</option>
            <option value="VIP">VIP</option>
          </select>

          {errors.subscription && (
            <p className="text-red-400 text-sm mt-1">{errors.subscription}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          Create User
        </button>
      </form>
    </div>
  );
}
