"use client";

import { ArrowRight } from "lucide-react";
import flowImage from "@/assets/flow.png";
import mouseClick from "@/assets/mouse-click.png";
import { useRouter } from "next/navigation";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useRef } from "react";

export const Hero = () => {
  const router = useRouter();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  useMotionValueEvent(translateY, "change", (latestValue) =>
    console.log(latestValue)
  );

  return (
    <section
      ref={heroRef}
      className="pt-8 pb-20 md:pt-5 md:pb-10 overflow-x-clip"
    >
      <div className="container">
        <div className="md:flex items-center">
          <div className="md:w-[478px]">
            <div className="tag text-md">Version 1.0 is here</div>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tigher bg-gradient-to-b from-black to-[#001e80] text-transparent bg-clip-text mt-6">
              Pathway to productivity
            </h1>
            <p className="text-2xl text-[#010d3e] tracking-tight mt-6">
              Create AI-powered workflows to connect your apps and automate
              repetitive tasks effortlessly.
            </p>
            <div className="flex gap-1 items-center mt-[30px]">
              <button
                className="btn btn-primary"
                onClick={() => router.push("/auth/signup")}
              >
                Start for free
              </button>
              <button className="btn btn-text gap-1">
                <span>Learn more</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-20 md:mt-0 md:h-[648px] md:flex-1 relative">
            <motion.img
              src={flowImage.src}
              alt="Cog image"
              className="md:absolute md:h-full md:w-auto md:max-w-none md:-left-6 lg:left-0"
              animate={{
                translateY: [-10, 10],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "mirror",
                duration: 3,
                ease: "easeInOut",
              }}
            />

            <motion.img
              src={mouseClick.src}
              width={220}
              alt="noodleImage"
              className="hidden lg:block absolute top-[424px] left-[448px]"
              style={{
                rotate: 0,
                translateY: translateY,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
