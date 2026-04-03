"use client";

import "@measured/puck/puck.css";

import { Puck, type Config, type Data } from "@measured/puck";
import { useState } from "react";
import { AiChatButton } from "./ai-chat-button";

type PuckProps = {
  HeadingBlock: { title: string; level: "h1" | "h2" | "h3" | "h4"; align: "left" | "center" | "right" };
  TextBlock: { content: string; align: "left" | "center" | "right"; size: "sm" | "md" | "lg" };
  ImageBlock: { src: string; alt: string; width: "full" | "half" | "third" };
  ButtonBlock: { label: string; href: string; variant: "primary" | "secondary" | "outline" };
  SpacerBlock: { height: number };
  ContainerBlock: { padding: number };
  CardBlock: { title: string; description: string; imageUrl: string };
  DividerBlock: Record<string, never>;
};

const config: Config<PuckProps> = {
  categories: {
    layout: {
      components: ["ContainerBlock", "SpacerBlock", "DividerBlock"],
      title: "Layout",
    },
    typography: {
      components: ["HeadingBlock", "TextBlock"],
      title: "Typography",
    },
    media: {
      components: ["ImageBlock", "CardBlock"],
      title: "Media",
    },
    interactive: {
      components: ["ButtonBlock"],
      title: "Interactive",
    },
  },
  components: {
    HeadingBlock: {
      fields: {
        title: { type: "text" },
        level: {
          type: "select",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
            { label: "H4", value: "h4" },
          ],
        },
        align: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: { title: "Heading", level: "h2", align: "left" },
      render: ({ title, level, align }) => {
        const Tag = level;
        const sizes: Record<string, string> = { h1: "2.5rem", h2: "2rem", h3: "1.5rem", h4: "1.25rem" };
        return (
          <Tag style={{ textAlign: align, fontSize: sizes[level], fontWeight: 700, margin: "0.5em 0", color: "black" }}>
            {title}
          </Tag>
        );
      },
    },
    TextBlock: {
      fields: {
        content: { type: "textarea" },
        align: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        size: {
          type: "radio",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
      },
      defaultProps: { content: "Enter your text here...", align: "left", size: "md" },
      render: ({ content, align, size }) => {
        const fontSizes: Record<string, string> = { sm: "0.875rem", md: "1rem", lg: "1.125rem" };
        return (
          <p style={{ textAlign: align, fontSize: fontSizes[size], lineHeight: 1.6, margin: "0.5em 0", color: "black" }}>
            {content}
          </p>
        );
      },
    },
    ImageBlock: {
      fields: {
        src: { type: "text" },
        alt: { type: "text" },
        width: {
          type: "radio",
          options: [
            { label: "Full", value: "full" },
            { label: "Half", value: "half" },
            { label: "Third", value: "third" },
          ],
        },
      },
      defaultProps: { src: "https://placehold.co/800x400/e2e8f0/64748b?text=Image", alt: "Image", width: "full" },
      render: ({ src, alt, width }) => {
        const widths: Record<string, string> = { full: "100%", half: "50%", third: "33.33%" };
        return (
          <div style={{ width: widths[width], margin: "0.5em 0" }}>
            <img src={src} alt={alt} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />
          </div>
        );
      },
    },
    ButtonBlock: {
      fields: {
        label: { type: "text" },
        href: { type: "text" },
        variant: {
          type: "radio",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
          ],
        },
      },
      defaultProps: { label: "Click me", href: "#", variant: "primary" },
      render: ({ label, href, variant }) => {
        const styles: Record<string, React.CSSProperties> = {
          primary: { background: "#3b82f6", color: "#fff", border: "none" },
          secondary: { background: "#64748b", color: "#fff", border: "none" },
          outline: { background: "transparent", color: "black", border: "2px solid black" },
        };
        return (
          <a
            href={href}
            style={{
              display: "inline-block",
              padding: "10px 24px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              margin: "0.5em 0",
              ...styles[variant],
            }}
          >
            {label}
          </a>
        );
      },
    },
    SpacerBlock: {
      fields: {
        height: { type: "number", min: 4, max: 200 },
      },
      defaultProps: { height: 32 },
      render: ({ height }) => <div style={{ height }} />,
    },
    ContainerBlock: {
      fields: {
        padding: { type: "number", min: 0, max: 100 },
      },
      defaultProps: { padding: 24 },
      render: ({ padding, puck }) => (
        <div
          style={{
            padding,
            borderRadius: 8,
            border: "1px dashed rgba(0,0,0,0.15)",
            minHeight: 60,
          }}
        >
          {puck.renderDropZone({ zone: "container-content" })}
        </div>
      ),
    },
    CardBlock: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        imageUrl: { type: "text" },
      },
      defaultProps: {
        title: "Card Title",
        description: "Card description goes here.",
        imageUrl: "https://placehold.co/400x200/e2e8f0/64748b?text=Card",
      },
      render: ({ title, description, imageUrl }) => (
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.12)",
            margin: "0.5em 0",
            background: "rgba(0,0,0,0.02)",
          }}
        >
          <img src={imageUrl} alt={title} style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
          <div style={{ padding: 16 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 600, color: "black" }}>{title}</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>
              {description}
            </p>
          </div>
        </div>
      ),
    },
    DividerBlock: {
      fields: {},
      defaultProps: {},
      render: () => (
        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgba(0,0,0,0.15)",
            margin: "1em 0",
          }}
        />
      ),
    },
  },
};

const INITIAL_DATA: Data = {
  content: [],
  root: { props: { title: "" } },
};

export default function PuckEditorClient() {
  const [data] = useState<Data>(INITIAL_DATA);

  return (
    <div style={{ background: "white", color: "black", minHeight: "100vh", position: "relative" }}>
      <Puck
        config={config}
        data={data}
        onPublish={(publishedData) => {
          console.log("Published:", publishedData);
        }}
      />
      <AiChatButton />
    </div>
  );
}
