"use client" 
import { updateUser, createUserType, getUsers, User } from "@/lib/userApi"; 
import { useEffect, useState } from "react";
import { BiCross, BiX } from "react-icons/bi";
import { toast } from "sonner";
import { Skeleton } from "three";

type EditUserProps = {
  user: User ;
  setEditUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUsers:React.Dispatch<React.SetStateAction<User[]>>;
};

export default function EditUser({ setEditUser,user,setUsers }: EditUserProps) {
  const [form, setForm] = useState<User >({
    name: user.name,
    email: user.email, 
    role: user.role, 
    status: user.status,
    is_active:user.is_active
  }); 
  const [errors, setErrors] = useState<any>({});

  // Validation function
  const validate = () => {
    let temp: any = {};

    if (!form.name.trim()) temp.name = "Full name is required.";
    if (!form.email.trim()) temp.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      temp.email = "Invalid email format.";

    
    if (!form.role) temp.role = "Please select a role.";
    // if (!form.subscription) temp.subscription = "Please select subscription.";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const submitForm = async(e: any) => {
    e.preventDefault();

    if (!validate()) return;

    let userCreation = await updateUser({id:user.id,...form});
    console.log("userCreation",userCreation)
    if(userCreation.msg == "User updated successfully") {
        setEditUser(null);
      toast.success(userCreation.msg)
     setUsers((prev) =>
    prev.map((u) =>
      u.id == user.id
        ? {id:user.id,...form} // 👈 update only this user
        : u
    )
  ); 
    }
    else{
            toast.error("Error Occurred while updating")

    } 
  };

  return (
    <div className="p-2 md:p-6 w-full mx-auto text-white   md:mt-0 mt-16">
      <div className="flex flex-row items-start w-full justify-between">
        <div className="fex flex-col items-start ">
          <h1 className="text-3xl font-bold mb-2">Create New User</h1>
      <p className="text-neutral-400 mb-6">Fill details to create a new user.</p>
        </div>
        <BiX size={40} onClick={()=>setEditUser(null)} className="cursor-pointer"/>
      </div>

      <form
        onSubmit={submitForm}
        className="space-y-6 bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-xl"
      >
        {/* Name */}
        <div>
          <label className="block mb-1 text-gray-300">Full Name</label>
          <input
            type="text"
            className="w-full p-3 bg-neutral-700 rounded-lg outline-none border border-gray-600 focus:border-blue-500"
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
            className="w-full p-3 bg-neutral-700 rounded-lg outline-none border border-gray-600 focus:border-blue-500"
            placeholder="example@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

       

        {/* Role */}
        <div>
          <label className="block mb-1 text-gray-300">Active Status</label>
          <select
            className="w-full p-3 bg-neutral-700 rounded-lg border border-gray-600 focus:border-blue-500"
            value={String(form.is_active)}
            onChange={(e) => setForm({ ...form, is_active: Boolean(e.target.value) })}
          >
            <option value="">Select role</option>
            <option value={String(true)}>active</option>
            <option value={String(false)}>inactive</option>
          </select>

          {errors.is_active && (
            <p className="text-red-400 text-sm mt-1">{errors.is_active}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-gray-300">Status</label>
          <select
            className="w-full p-3 bg-neutral-700 rounded-lg border border-gray-600 focus:border-blue-500"
            value={String(form.status)}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="">Select role</option>
            <option value="active">active</option>
              <option value="banned">banned</option>
              <option value="suspended">suspended</option> 
          </select>

          {errors.is_active && (
            <p className="text-red-400 text-sm mt-1">{errors.is_active}</p>
          )}
        </div>
<div>
          <label className="block mb-1 text-gray-300">User Role</label>
          <select
            className="w-full p-3 bg-neutral-700 rounded-lg border border-gray-600 focus:border-blue-500"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="">Select role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="beta_tester">Tester</option>
          </select>

          {errors.role && (
            <p className="text-red-400 text-sm mt-1">{errors.role}</p>
          )}
        </div>
        {/* Subscription */}
        {/* <div>
          <label className="block mb-1 text-gray-300">Subscription</label>
          <select
            className="w-full p-3 bg-neutral-700 rounded-lg border border-gray-600 focus:border-blue-500"
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
        </div> */}

        {/* Submit */}
        <button
          type="submit"
          className="w-full p-3 bg-[var(--main-color)] rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          Update User
        </button>
      </form>
    </div>
  );
}