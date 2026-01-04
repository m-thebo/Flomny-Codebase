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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { signInSchema } from "@/lib/validations/auth";

type FormData = z.infer<typeof signInSchema>;

const SignIn: NextPage = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const result = await login(data);

      if (result.success) {
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000,
        });

        router.push("/dashboard");
      } else {
        toast.error(result.error || "Invalid email or password.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.error("Unexpected error during login:", err);
      toast.error("An unexpected error occurred. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header buttonText="Sign Up" buttonRoute="/auth/signup" />
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
        <div className="flex w-full md:w-1/2 justify-center items-center bg-white mt-12 md:mt-0">
          <div className="w-full max-w-md px-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Login to your Account
            </h2>
            <p className="text-center mb-6 text-gray-400">
              See what is going on with your business
            </p>

            {/* Google Login Button */}
            <button
              disabled
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-md mb-4 flex items-center justify-center hover:shadow"
            >
              <Image
                src={googleLogo.src}
                alt="Google Icon"
                width={20}
                height={20}
                className="mr-2"
              />
              Continue with Google
            </button>

            <div className="text-center text-gray-400 mb-4">
              or Sign in with Email
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
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

              {/* Password Field */}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Link to Sign Up */}
            <div className="text-center mt-6">
              Not Registered Yet?{" "}
              <a
                href="/auth/signup"
                className="text-blue-500 font-medium hover:underline"
              >
                Create an account
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
