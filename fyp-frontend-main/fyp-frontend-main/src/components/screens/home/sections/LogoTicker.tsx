"use client";

import whatsappLogo from "@/assets/integrations-logos/whatsapp.png";
import youtubeLogo from "@/assets/integrations-logos/youtube.png";
import discordLogo from "@/assets/integrations-logos/discord.png";
import slackLogo from "@/assets/integrations-logos/slack.png";
import googleDriveLogo from "@/assets/integrations-logos/googledrive.png";
import notionLogo from "@/assets/integrations-logos/notion.png";

import Image from "next/image";
import { motion } from "framer-motion";

export const LogoTicker = () => {
  return (
    <div className="py-8 md:py-12 bg-white">
      <div className="container">
        <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black,transparent)]">
          <motion.div
            className="flex gap-14 flex-none pr-14"
            animate={{
              translateX: "-50%",
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop",
            }}
          >
            <Image
              src={whatsappLogo}
              alt="whatsapp Logo"
              className="logo-ticker-image"
            />
            <Image
              src={youtubeLogo}
              alt="youtube Logo"
              className="logo-ticker-image"
            />
            <Image
              src={googleDriveLogo}
              alt="google drive Logo"
              className="logo-ticker-image"
            />
            <Image
              src={discordLogo}
              alt="discord Logo"
              className="logo-ticker-image"
            />
            <Image
              src={slackLogo}
              alt="slack Logo"
              className="logo-ticker-image"
            />
            <Image
              src={notionLogo}
              alt="apex Logo"
              className="logo-ticker-image"
            />

            {/* second set of logos for animation */}
            <Image
              src={whatsappLogo}
              alt="acme Logo"
              className="logo-ticker-image"
            />
            <Image
              src={youtubeLogo}
              alt="youtube Logo"
              className="logo-ticker-image"
            />
            <Image
              src={googleDriveLogo}
              alt="google drive Logo"
              className="logo-ticker-image"
            />
            <Image
              src={discordLogo}
              alt="discord Logo"
              className="logo-ticker-image"
            />
            <Image
              src={slackLogo}
              alt="slack Logo"
              className="logo-ticker-image"
            />
            <Image
              src={notionLogo}
              alt="notion Logo"
              className="logo-ticker-image"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
