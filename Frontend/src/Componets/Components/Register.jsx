import React, { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  // Validation (same style as your first form)
  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Image Section */}
      {/* <div className="hidden md:flex w-1/2 items-center justify-center p-10">
        <img
          src="/images/register.jpg" // <-- change path to your image
          alt="Register"
          className="w-[90%] h-auto rounded-xl shadow-lg object-cover"
        />
      </div> */}
      <div className="flex w-full justify-center items-center p-4 md:p-6">
        <form
          className="flex flex-col gap-4 w-full max-w-lg p-3 md:p-6 rounded-2xl bg-gray-300 border border-gray-200 text-gray-900 shadow-lg"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Title */}
          <p className="text-2xl font-semibold text-primary relative pl-8 flex items-center">
            Register
            {/* <span className="absolute left-0 w-4 h-4 rounded-full bg-primary"></span>
            <span className="absolute left-0 w-4 h-4 rounded-full bg-primary animate-pulse"></span> */}
          </p>

          {/* Username */}
          <label className="relative mb-2">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder=" "
              className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
                errors.username ? "border-red-500" : "border-gray-300"
              } text-gray-900 focus:outline-none focus:border-primary peer`}
            />
            <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
              Username <span className="text-red-500">*</span>
            </span>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1 absolute">
                {errors.username}
              </p>
            )}
          </label>

          {/* Email */}
          <label className="relative mb-2">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } text-gray-900 focus:outline-none focus:border-primary peer`}
            />
            <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
              Email <span className="text-red-500">*</span>
            </span>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 absolute">
                {errors.email}
              </p>
            )}
          </label>

          {/* Phone */}
          <label className="relative mb-2">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder=" "
              className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } text-gray-900 focus:outline-none focus:border-primary peer`}
            />
            <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
              Phone Number <span className="text-red-500">*</span>
            </span>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 absolute">
                {errors.phone}
              </p>
            )}
          </label>

          {/* Password */}
          <label className="relative mb-2">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } text-gray-900 focus:outline-none focus:border-primary peer`}
            />
            <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
              Password <span className="text-red-500">*</span>
            </span>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 absolute">
                {errors.password}
              </p>
            )}
          </label>

          {/* Confirm Password */}
          <label className="relative mb-2">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder=" "
              className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } text-gray-900 focus:outline-none focus:border-primary peer`}
            />
            <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
              Confirm Password <span className="text-red-500">*</span>
            </span>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 absolute">
                {errors.confirmPassword}
              </p>
            )}
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="
            relative group
            mb-2
            px-4 py-2
            text-[15px] md:text-[17px] font-medium
            border border-primary
            rounded-full
            text-primary
            overflow-hidden
            cursor-pointer
            transition-colors duration-500 ease-out
          "
          >
            <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-500 group-hover:text-white">
              Register
            </span>
            <span
              className="
              absolute inset-0
              bg-primary
              scale-x-0 group-hover:scale-x-100
              origin-left
              transition-transform duration-500 ease-out
              z-0
            "
            ></span>
          </button>

          {submitted && (
            <p
              className={`text-green-600 text-sm mt-2 transition-opacity duration-500 ${
                submitted ? "opacity-100" : "opacity-0"
              }`}
            >
              ✅ Registered successfully!
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;


// import React, { useState } from "react";

// const Register = () => {
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [submitted, setSubmitted] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//     setErrors({
//       ...errors,
//       [e.target.name]: "",
//     });
//   };

//   const validate = () => {
//     const newErrors = {};
//     if (!formData.username.trim()) newErrors.username = "Username is required";
//     if (!formData.email.trim()) newErrors.email = "Email is required";
//     else if (!/\S+@\S+\.\S+/.test(formData.email))
//       newErrors.email = "Enter a valid email";
//     if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
//     else if (!/^[0-9]{10}$/.test(formData.phone))
//       newErrors.phone = "Enter a valid 10-digit phone number";
//     if (!formData.password.trim()) newErrors.password = "Password is required";
//     else if (formData.password.length < 6)
//       newErrors.password = "Password must be at least 6 characters";
//     if (!formData.confirmPassword.trim())
//       newErrors.confirmPassword = "Confirm your password";
//     else if (formData.password !== formData.confirmPassword)
//       newErrors.confirmPassword = "Passwords do not match";
//     return newErrors;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }
//     setSubmitted(true);
//     setTimeout(() => setSubmitted(false), 3000);
//     setFormData({
//       username: "",
//       email: "",
//       phone: "",
//       password: "",
//       confirmPassword: "",
//     });
//   };

//   return (
//     <div className="flex px-5 py-5 min-h-screen w-full">
//       {/* Left Image */}
//       <div className="w-1/2 h-screen">
//         <img
//           src="/images/register.jpg"
//           alt="Register"
//           className="w-full h-full object-cover"
//         />
//       </div>

//       {/* Right Form Section with full gray background */}
//       <div className="w-1/2 h-screen bg-gray-300 flex items-center justify-center">
//         <form
//           className="flex flex-col gap-4 w-3/4 md:w-2/3 p-6 rounded-2xl bg-gray-300 text-gray-900 shadow-lg"
//           onSubmit={handleSubmit}
//           noValidate
//         >
//           {/* Title */}
//           <p className="text-2xl font-semibold text-primary relative pl-8 flex items-center">
//             Register
//             <span className="absolute left-0 w-4 h-4 rounded-full bg-primary"></span>
//             <span className="absolute left-0 w-4 h-4 rounded-full bg-primary animate-pulse"></span>
//           </p>

//           {/* Username */}
//           <label className="relative mb-2">
//             <input
//               type="text"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               placeholder=" "
//               className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
//                 errors.username ? "border-red-500" : "border-gray-300"
//               } text-gray-900 focus:outline-none focus:border-primary peer`}
//             />
//             <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
//               Username <span className="text-red-500">*</span>
//             </span>
//             {errors.username && (
//               <p className="text-red-500 text-xs mt-1 absolute">{errors.username}</p>
//             )}
//           </label>

//           {/* Email */}
//           <label className="relative mb-2">
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder=" "
//               className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
//                 errors.email ? "border-red-500" : "border-gray-300"
//               } text-gray-900 focus:outline-none focus:border-primary peer`}
//             />
//             <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
//               Email <span className="text-red-500">*</span>
//             </span>
//             {errors.email && (
//               <p className="text-red-500 text-xs mt-1 absolute">{errors.email}</p>
//             )}
//           </label>

//           {/* Phone */}
//           <label className="relative mb-2">
//             <input
//               type="tel"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               placeholder=" "
//               className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
//                 errors.phone ? "border-red-500" : "border-gray-300"
//               } text-gray-900 focus:outline-none focus:border-primary peer`}
//             />
//             <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
//               Phone Number <span className="text-red-500">*</span>
//             </span>
//             {errors.phone && (
//               <p className="text-red-500 text-xs mt-1 absolute">{errors.phone}</p>
//             )}
//           </label>

//           {/* Password */}
//           <label className="relative mb-2">
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder=" "
//               className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
//                 errors.password ? "border-red-500" : "border-gray-300"
//               } text-gray-900 focus:outline-none focus:border-primary peer`}
//             />
//             <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
//               Password <span className="text-red-500">*</span>
//             </span>
//             {errors.password && (
//               <p className="text-red-500 text-xs mt-1 absolute">{errors.password}</p>
//             )}
//           </label>

//           {/* Confirm Password */}
//           <label className="relative mb-2">
//             <input
//               type="password"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               placeholder=" "
//               className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
//                 errors.confirmPassword ? "border-red-500" : "border-gray-300"
//               } text-gray-900 focus:outline-none focus:border-primary peer`}
//             />
//             <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
//               Confirm Password <span className="text-red-500">*</span>
//             </span>
//             {errors.confirmPassword && (
//               <p className="text-red-500 text-xs mt-1 absolute">
//                 {errors.confirmPassword}
//               </p>
//             )}
//           </label>

//           {/* Submit */}
//           <button
//             type="submit"
//             className="relative group mb-2 px-4 py-2 text-[15px] md:text-[17px] font-medium border border-primary rounded-full text-primary overflow-hidden cursor-pointer transition-colors duration-500 ease-out"
//           >
//             <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-500 group-hover:text-white">
//               Register
//             </span>
//             <span className="absolute inset-0 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out z-0"></span>
//           </button>

//           {submitted && (
//             <p className="text-green-600 text-sm mt-2 transition-opacity duration-500">
//               ✅ Registered successfully!
//             </p>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;
