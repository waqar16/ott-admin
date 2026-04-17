// "use client" 
// import { updateCreator, createCreator, getCreators, Creator } from "@/lib/creatorApi"; 
// import { useEffect, useState } from "react";
// import { BiCross, BiX } from "react-icons/bi";
// import { toast } from "sonner";
// import { Skeleton } from "three";

// type EditUserProps = {
//   creator: Creator ;
//   setEditUser: React.Dispatch<React.SetStateAction<Creator | null>>;
//   setUsers:React.Dispatch<React.SetStateAction<Creator[]>>;
// };

// export default function CreatorEditor({ setEditUser,creator,setUsers }: EditUserProps) {
//   const [form, setForm] = useState<Creator >({
//     name: creator.name,
//     email: creator.email, 
//     phone: creator.phone, 
//     bio: creator.bio
//   }); 
//   const [errors, setErrors] = useState<any>({});

//   // Validation function
//   const validate = () => {
//     let temp: any = {};

//     if (!form.name.trim()) temp.name = "Full name is required.";
//     if (!form.email.trim()) temp.email = "Email is required.";
//     else if (!/\S+@\S+\.\S+/.test(form.email))
//       temp.email = "Invalid email format.";

      

//     setErrors(temp);
//     return Object.keys(temp).length === 0;
//   };

//   const submitForm = async(e: any) => {
//     e.preventDefault();

//     if (!validate()) return;

//     let userCreation = await updateCreator({id:creator.id,...form}); 
//     if(userCreation.id) {
//         setEditUser(null);
//       toast.success("Creator updated successfully")
//      setUsers((prev) =>
//     prev.map((u) =>
//       u.id == creator.id
//         ? {id:creator.id,...form} // 👈 update only this creator
//         : u
//     )
//   ); 
//     }
//     else{
//             toast.error("Error Occurred while updating")

//     } 
//   };

//   return (
//     <div className="p-2 md:p-6 w-full mx-auto text-white   md:mt-0 mt-16">
//       <div className="flex flex-row items-start w-full justify-between">
//         <div className="fex flex-col items-start ">
//           <h1 className="text-3xl font-bold mb-2">Create New Creator</h1>
//       <p className="text-neutral-400 mb-6">Fill details to create a new creator.</p>
//         </div>
//         <BiX size={40} onClick={()=>setEditUser(null)} className="cursor-pointer"/>
//       </div>

//       <form
//         onSubmit={submitForm}
//         className="space-y-6 bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-xl"
//       >
//         {/* Name */}
//         <div>
//           <label className="block mb-1 text-gray-300">Full Name</label>
//           <input
//             type="text"
//             className="w-full p-3 bg-neutral-700 rounded-lg outline-none border border-gray-600 focus:border-blue-500"
//             placeholder="John Doe"
//             value={form.name}
//             onChange={(e) => setForm({ ...form, name: e.target.value })}
//           />
//           {errors.name && (
//             <p className="text-red-400 text-sm mt-1">{errors.name}</p>
//           )}
//         </div>

//         {/* Email */}
//         <div>
//           <label className="block mb-1 text-gray-300">Email Address</label>
//           <input
//             type="email"
//             className="w-full p-3 bg-neutral-700 rounded-lg outline-none border border-gray-600 focus:border-blue-500"
//             placeholder="example@email.com"
//             value={form.email}
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//           />
//           {errors.email && (
//             <p className="text-red-400 text-sm mt-1">{errors.email}</p>
//           )}
//         </div>

//        <div>
//           <label className="block mb-1 text-gray-300">Phone Number</label>
//           <input
//             type="text"
//             className="w-full p-3 bg-neutral-700 rounded-lg outline-none border border-gray-600 focus:border-blue-500"
//             placeholder="123-456-7890"
//             value={form.phone}
//             onChange={(e) => setForm({ ...form, phone: e.target.value })}
//           />
//           {errors.phone && (
//             <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
//           )}
//         </div>
//              <div>
//           <label className="block mb-1 text-gray-300">Bio</label>
//           <input
//             type="text"
//             className="w-full p-3 bg-neutral-700 rounded-lg outline-none border border-gray-600 focus:border-blue-500"
//             placeholder="Tell us about yourself"
//             value={form.bio}
//             onChange={(e) => setForm({ ...form, bio: e.target.value })}
//           />
//           {errors.bio && (
//             <p className="text-red-400 text-sm mt-1">{errors.bio}</p>
//           )}
//         </div>
           
//         {/* Subscription */}
//         {/* <div>
//           <label className="block mb-1 text-gray-300">Subscription</label>
//           <select
//             className="w-full p-3 bg-neutral-700 rounded-lg border border-gray-600 focus:border-blue-500"
//             value={form.subscription}
//             onChange={(e) =>
//               setForm({ ...form, subscription: e.target.value })
//             }
//           >
//             <option value="">Select subscription</option>
//             <option value="Free">Free</option>
//             <option value="Premium">Premium</option>
//             <option value="VIP">VIP</option>
//           </select>

//           {errors.subscription && (
//             <p className="text-red-400 text-sm mt-1">{errors.subscription}</p>
//           )}
//         </div> */}

//         {/* Submit */}
//         <button
//           type="submit"
//           className="w-full p-3 bg-[var(--main-color)] rounded-lg text-lg font-semibold hover:bg-blue-700"
//         >
//           Update Creator
//         </button>
//       </form>
//     </div>
//   );
// }

"use client" 
import { updateCreator, createCreator, Creator } from "@/lib/creatorApi"; 
import { use, useState } from "react";
import { BiX } from "react-icons/bi";
import { toast } from "sonner";

type CreatorEditorProps = {
  creator?: Creator | null; // Make creator optional
  setEditUser: React.Dispatch<React.SetStateAction<Creator | null>>;
  setUsers: React.Dispatch<React.SetStateAction<Creator[]>>;
};

export default function CreatorEditor({ setEditUser, creator, setUsers }: CreatorEditorProps) {
  const isEditMode = !!creator; // Determine if we're editing or creating
  
  const [form, setForm] = useState<Omit<Creator, 'id'>>({
    name: creator?.name || "",
    email: creator?.email || "", 
    phone: creator?.phone || "", 
    bio: creator?.bio || ""
  }); 
  const [errors, setErrors] = useState<any>({});

  // Validation function
  const validate = () => {
    let temp: any = {};

    if (!form.name.trim()) temp.name = "Full name is required.";
    if (!form.email.trim()) temp.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      temp.email = "Invalid email format.";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const submitForm = async(e: any) => {
    e.preventDefault();

    if (!validate()) return;

    if (isEditMode && creator) {
      // Update existing creator
      let userUpdate = await updateCreator({id: creator.id, ...form}); 
      if(userUpdate.data.id) {
        setEditUser(null);
        toast.success("Creator updated successfully");
        setUsers((prev) =>
          prev.map((u) =>
            u.id === creator.id
              ? {id: creator.id, ...form}
              : u
          )
        ); 
        
      } else {
               toast.error(userUpdate.error || userUpdate.msg || "Error occurred while updating");
      } 
    } else {
      // Create new creator
      let userCreation = await createCreator(form); 
      if(userCreation.data.id) {
        setEditUser(null);
        toast.success("Creator created successfully");
        setUsers((prev) => [...prev, userCreation.data]); 
      } else {
        toast.error(userCreation.error ||   "Error occurred while creating");
      } 
    }
  };

  return (
    <div className="p-2 md:p-6 w-full mx-auto text-white md:mt-0 mt-16">
      <div className="flex flex-row items-start w-full justify-between">
        <div className="flex flex-col items-start">
          <h1 className="text-3xl font-bold mb-2">
            {isEditMode ? "Edit Creator" : "Create New Creator"}
          </h1>
          <p className="text-neutral-400 mb-6">
            {isEditMode ? "Update creator details." : "Fill details to create a new creator."}
          </p>
        </div>
        <BiX size={40} onClick={() => setEditUser(null)} className="cursor-pointer"/>
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

        <div>
          <label className="block mb-1 text-gray-300">Phone Number</label>
          <input
            type="text"
            className="w-full p-3 bg-neutral-700 rounded-lg outline-none border border-gray-600 focus:border-blue-500"
            placeholder="123-456-7890"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
        
        <div>
          <label className="block mb-1 text-gray-300">Bio</label>
          <input
            type="text"
            className="w-full p-3 bg-neutral-700 rounded-lg outline-none border border-gray-600 focus:border-blue-500"
            placeholder="Tell us about yourself"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          {errors.bio && (
            <p className="text-red-400 text-sm mt-1">{errors.bio}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full p-3 bg-[var(--main-color)] rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          {isEditMode ? "Update Creator" : "Create Creator"}
        </button>
      </form>
    </div>
  );
}