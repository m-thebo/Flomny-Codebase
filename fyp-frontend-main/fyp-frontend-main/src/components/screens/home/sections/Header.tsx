"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "@/assets/logosaas.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header className="sticky top-0 backdrop-blur-sm z-20">
      {/* Top Bar */}
      <div className="flex justify-center items-center py-3 bg-black text-white text-sm gap-3">
        <p className="text-white/60 hidden md:block">
          Streamline your workflow and boost your productivity
        </p>
        <div className="inline-flex gap-1 items-center">
          <p>Get started for free</p>
          <ArrowRight className="h-4 w-4 inline-flex justify-center items-center" />
        </div>
      </div>

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

            {/* Burger Menu Icon */}
            <div className="md:hidden">
              {isMenuOpen ? (
                <X className="h-4 w-4 cursor-pointer" onClick={toggleMenu} />
              ) : (
                <Menu className="h-6 w-6 cursor-pointer" onClick={toggleMenu} />
              )}
            </div>

            {/* Navigation for Desktop */}
            <nav className="hidden md:flex gap-6 text-black/60 items-center">
              <a href="#about">About</a>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#integrations">Integrations</a>
              <a href="#contact">Contact</a>
              <button
                className="bg-black text-white px-4 py-2 rounded-lg font-medium inline-flex align-items justify-center tracking-tight"
                onClick={() => router.push("/auth/signup")}
              >
                Start for free
              </button>
            </nav>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-white shadow-md rounded-lg p-5 md:hidden z-50">
              <nav className="flex flex-col gap-4 text-black">
                <a href="#about" onClick={toggleMenu}>
                  About
                </a>
                <a href="#features" onClick={toggleMenu}>
                  Features
                </a>
                <a href="#pricing" onClick={toggleMenu}>
                  Pricing
                </a>
                <a href="#integrations" onClick={toggleMenu}>
                  Integrations
                </a>
                <a href="#contact" onClick={toggleMenu}>
                  Contact
                </a>
                <button
                  className="bg-black text-white px-4 py-2 rounded-lg font-medium tracking-tight"
                  onClick={() => {
                    toggleMenu();
                    router.push("/auth/signup");
                  }}
                >
                  Start for free
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
