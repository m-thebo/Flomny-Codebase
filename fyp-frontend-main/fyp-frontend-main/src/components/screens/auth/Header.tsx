"use client";

import Logo from "@/assets/logosaas.png";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface HeaderProps {
  buttonText: string;
  buttonRoute: string;
}

export const Header: NextPage<HeaderProps> = ({ buttonText, buttonRoute }) => {
  const router = useRouter();

  return (
    <header className="sticky top-0 backdrop-blur-sm z-20">
      {/* Main Header */}
      <div className="py-5 border-b-2 border-gray-200">
        <div className="container">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Image
              src={Logo}
              alt="Saas Logo"
              height={40}
              width={40}
              onClick={() => router.push("/")}
            />

            <button
              className="bg-black text-white px-4 py-2 rounded-lg font-medium inline-flex align-items justify-center tracking-tight"
              onClick={() => router.push(buttonRoute)}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
