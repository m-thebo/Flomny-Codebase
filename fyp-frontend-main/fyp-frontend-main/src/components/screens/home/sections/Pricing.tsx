"use client";

import { Check } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

const pricingTiers = [
  {
    title: "Free",
    monthlyPrice: 0,
    buttonText: "Get started for free",
    popular: false,
    inverse: false,
    features: [
      "5 AI Agents",
      "100 tasks per month",
      "Basic Integrations",
      "Email Support",
      "Basic Customizations",
    ],
  },
  {
    title: "Pro",
    monthlyPrice: 99,
    buttonText: "Sign up now",
    popular: true,
    inverse: true,
    features: [
      "20 AI Agents",
      "Unlimited tasks",
      "50GB storage",
      "Advanced Integrations",
      "Priority support",
      "Basic Analytics",
      "Basic Customizations",
    ],
  },
  {
    title: "Business",
    monthlyPrice: 499,
    buttonText: "Sign up now",
    popular: false,
    inverse: false,
    features: [
      "Unlimited AI Agents",
      "Unlimited tasks",
      "1TB storage",
      "Advanced Integrations",
      "Dedicated Support",
      "Custom fields",
      "Advanced analytics",
      "Export capabilities",
      "API access",
      "Advanced Customizations",
    ],
  },
];

export const Pricing = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container">
        <div className="section-heading">
          <h2 className="section-title" id="pricing">
            Pricing
          </h2>
          <p className="section-description mt-5">
            Free forever. Upgrade for more AI Agents, unlimited tasks, better
            support, and exclusive features.
          </p>
        </div>
        <div className="flex flex-col gap-6 items-center mt-10 lg:flex-row lg:items-end lg:justify-center">
          {pricingTiers.map(
            ({
              title,
              monthlyPrice,
              buttonText,
              popular,
              inverse,
              features,
            }) => (
              <div
                className={twMerge(
                  "card",
                  inverse === true && "border-black bg-black text-white"
                )}
                key={title}
              >
                <div className="flex justify-between">
                  <h3
                    className={twMerge(
                      "text-lg font-bold text-black/50",
                      inverse === true && "text-white/60"
                    )}
                  >
                    {title}
                  </h3>
                  {popular === true && (
                    <div className="inline-flex text-sm px-4 py-1.5 rounded-xl border border-white/20">
                      <motion.span
                        animate={{
                          backgroundPositionX: "100%",
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                          repeatType: "loop",
                        }}
                        className="bg-[linear-gradient(to_right,#DD7DDF,#E1CD86,#BBCB92,#71C2EF,#3BFFFF,#DD7DDF)] [background-size:200%] text-transparent bg-clip-text font-medium"
                      >
                        Popular
                      </motion.span>
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mt-[30px]">
                  <span className="text-4xl font-bold tracking-tighter leading-none">
                    ${monthlyPrice}
                  </span>
                  <span
                    className={`tracking-tight font-bold ${
                      inverse ? "text-white" : "text-black/50"
                    }`}
                  >
                    /month
                  </span>
                </div>
                <button
                  className={twMerge(
                    "btn btn-primary w-full mt-[30px]",
                    inverse === true && "bg-white text-black"
                  )}
                >
                  {buttonText}
                </button>
                <ul className="flex flex-col gap-5 mt-8">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="text-sm flex items-center gap-4"
                    >
                      <Check className="h-6 w-6" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
          <div>
            <h3></h3>
          </div>
        </div>
      </div>
    </section>
  );
};
