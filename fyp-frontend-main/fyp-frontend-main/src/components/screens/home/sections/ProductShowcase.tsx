"use client";

import productImage from "@/assets/product-image.png";
import discord3d from "@/assets/discord3d.png";
import slack3d from "@/assets/slack3d.png";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const ProductShowcase = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-[#FFFFFF] to-[#D2DCFF] py-24 overflow-x-clip"
    >
      <div className="container">
        <div className="section-heading">
          <div className="flex justify-center items-center">
            <div className="tag">Boost your productivity</div>
          </div>
          <h2 className="section-title mt-5">Automate Your Workflows</h2>
          <p className="section-description mt-5">
            Connect your apps to save time, like sending Discord messages for
            new YouTube uploads.
          </p>
        </div>
        <div className="relative">
          <Image src={productImage} alt="product Image" className="mt-10" />
          <motion.img
            src={slack3d.src}
            alt="slack 3d Image"
            width={262}
            height={262}
            className="hidden md:block absolute -right-36 -top-32"
            style={{
              translateY,
            }}
          />
          <motion.img
            src={discord3d.src}
            alt="discord 3d Image"
            width={220}
            height={220}
            className="hidden md:block absolute bottom-24 -left-36"
            style={{
              translateY,
            }}
          />
        </div>
      </div>
    </section>
  );
};
