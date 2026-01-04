"use client";

import slackLogo from "@/assets/logos/slack.png";
import webflowLogo from "@/assets/logos/webflow.png";
import discord from "@/assets/logos/discord.png";
import googleDriveLogo from "@/assets/logos/googledrive.png";
import youtubeLogo from "@/assets/logos/youtube.png";
import whatsappLogo from "@/assets/logos/whatsapp.png";
import notionLogo from "@/assets/logos/notion.png";
import airtableLogo from "@/assets/logos/airtable.png";
import trelloLogo from "@/assets/logos/trello.png";
import Image from "next/image";
import { motion } from "framer-motion";
import React from "react";

const integrations = [
  {
    text: "Send message to Sales channel.",
    imageSrc: slackLogo.src,
    name: "Slack",
    username: "",
  },
  {
    text: "New website form submission.",
    imageSrc: webflowLogo.src,
    name: "Webflow",
    username: "",
  },
  {
    text: "Post a new update to Discord server.",
    imageSrc: discord.src,
    name: "Discord",
    username: "",
  },
  {
    text: "Automatically save attachments to Google Drive.",
    imageSrc: googleDriveLogo.src,
    name: "Google Drive",
    username: "",
  },
  {
    text: "Sync video updates with YouTube.",
    imageSrc: youtubeLogo.src,
    name: "YouTube",
    username: "",
  },
  {
    text: "Automate messages with WhatsApp Business.",
    imageSrc: whatsappLogo.src,
    name: "WhatsApp",
    username: "",
  },
  {
    text: "Organize tasks seamlessly with Notion.",
    imageSrc: notionLogo.src,
    name: "Notion",
    username: "",
  },
  {
    text: "Track real-time data in Airtable.",
    imageSrc: airtableLogo.src,
    name: "Airtable",
    username: "",
  },
  {
    text: "Send updates directly to Trello boards.",
    imageSrc: trelloLogo.src,
    name: "Trello",
    username: "",
  },
];

const firstColumn = integrations.slice(0, 3);
const secondColumn = integrations.slice(3, 6);
const thirdColumn = integrations.slice(6, 9);

const IntegrationsColumn = (props: {
  className?: string;
  integrations: typeof integrations;
  duration?: number;
}) => (
  <div className={props.className}>
    <motion.div
      animate={{
        translateY: "-50%",
      }}
      transition={{
        duration: props.duration || 10,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      }}
      className="flex flex-col gap-6 pb-6"
    >
      {[...new Array(2)].fill(0).map((_, index) => (
        <React.Fragment key={index}>
          {props.integrations.map(({ text, imageSrc, name }) => (
            <div className="card" key={text}>
              <div className="flex items-center gap-2 mt-2">
                <Image
                  src={imageSrc}
                  alt={name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="font-medium tracking-tight leading-5">
                  {name}
                </div>
              </div>
              <div className="mt-5">{text}</div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </motion.div>
  </div>
);

export const Integrations = () => {
  return (
    <section className="bg-white">
      <div className="container">
        <div className="section-heading">
          <div className="flex justify-center">
            <div className="tag" id="integrations">
              Integrations
            </div>
          </div>
          <h2 className="section-title mt-5">Integrations We Offer</h2>
          <p className="section-description mt-1">
            Seamlessly connect with the tools you use every day.
          </p>
        </div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[738px] overflow-hidden">
          <IntegrationsColumn integrations={firstColumn} duration={15} />
          <IntegrationsColumn
            integrations={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <IntegrationsColumn
            integrations={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
};
