"use client";

import { NextPage } from "next";
import { useForm } from "react-hook-form";
import cogLogo from "@/assets/cog.png";
import googleLogo from "@/assets/google-auth-icon.png";
import { Header } from "@/components/screens/auth/Header";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupSchema } from "@/lib/validations/auth";

// Define validation signupSchema with Zod

type FormData = z.infer<typeof signupSchema>;

const Signup: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
  });

  const { register: registerUser } = useAuth(); // Access `register` from useAuth
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    setLoading(true); // Start loading
    try {
      const { success, error } = await registerUser({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password,
      });

      if (success) {
        toast.success("Account created successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        router.push("/dashboard");
      } else {
        toast.error(error || "Failed to create account.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.error("Unexpected error during signup:", err);
      toast.error("An unexpected error occurred. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <>
      <Header buttonText="Login" buttonRoute="/auth/signin" />
      <div className="flex flex-col md:flex-row min-h-[90vh]">
        {/* Left Section (Hidden on small screens) */}
        <div className="hidden md:flex w-1/2 bg-gray-100 justify-center items-center">
          <div className="relative w-3/4 h-3/4">
            <Image
              src={cogLogo.src}
              alt="Placeholder image"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex w-full md:w-1/2 justify-center items-center bg-white mt-8 md:mt-0">
          <div className="w-full max-w-md px-6">
            <h2 className="text-2xl font-bold mb-2 text-center">
              Create Your Account
            </h2>
            <p className="text-center mb-2 text-gray-400">
              Join us and explore the opportunities
            </p>

            {/* Google Signup Button */}
            <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-md mb-2 flex items-center justify-center hover:shadow">
              <Image
                src={googleLogo.src}
                alt="Google Icon"
                width={20}
                height={20}
                className="mr-2"
              />
              Sign up with Google
            </button>

            <div className="text-center text-gray-400 mb-2">
              or Sign up with Email
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label
                    htmlFor="firstname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    id="firstname"
                    type="text"
                    {...register("firstname")}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 ${
                      errors.firstname ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="First Name"
                  />
                  {errors.firstname && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.firstname.message}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <label
                    htmlFor="lastname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastname"
                    type="text"
                    {...register("lastname")}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 ${
                      errors.lastname ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="Last Name"
                  />
                  {errors.lastname && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.lastname.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 ${
                    errors.email ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="Email"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 ${
                    errors.password ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="Password"
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 ${
                    errors.confirmPassword
                      ? "border-red-400"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm Password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-700 focus:ring-blue-400"
                }`}
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            </form>

            <div className="text-center mt-6">
              Already Have an Account?{" "}
              <a
                href="/auth/signin"
                className="text-blue-500 font-medium hover:underline"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
