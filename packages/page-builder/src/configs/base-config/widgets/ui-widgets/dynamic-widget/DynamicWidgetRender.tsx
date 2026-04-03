import { IDynamicWidgetRenderProps } from "./DynamicWidgetConfig";
import { useEffect, useState } from "react";
import { useIsEditing } from "../../../../../utils/use-puck";

export const DynamicWidgetRender = ({ text: htmlContent, puck, id }: IDynamicWidgetRenderProps) => {
  const isEditing = useIsEditing(puck);
  const [isMounted, setIsMounted] = useState(false);
  

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && htmlContent) {
      let frameEl: Element | Document | null | undefined = getIFrame(isEditing);
      const container = frameEl?.getElementById(id);
      if (container && frameEl) {
        container.innerHTML = htmlContent;
        handleStyles(container, frameEl);
        handleScripts(container);
      }
    }
  }, [htmlContent, isMounted]);

  if (!isMounted) return null;

  return (
    <div className="revert-base">
      <div id={id} />
    </div>
  );
};

const handleStyles = (container: HTMLElement, frameEl: Document) => {
  const styleTags = container.querySelectorAll<HTMLStyleElement>("style");
  styleTags.forEach((style) => {
    const newStyle = document.createElement("style");
    newStyle.innerHTML = style.innerHTML;
    frameEl.head.appendChild(newStyle);
  });

  const linkTags = container.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
  linkTags.forEach((link) => {
    const newLink = document.createElement("link");
    newLink.rel = "stylesheet";
    newLink.href = link.href;
    frameEl.head.appendChild(newLink);
  });
};
const handleScripts = (container: HTMLElement) => {
  const scripts = container.querySelectorAll<HTMLScriptElement>("script");

  scripts.forEach((existingScript) => {
    const newScript = document.createElement("script");

    if (existingScript.src) {
      newScript.src = existingScript.src;
    } else {
      newScript.textContent = existingScript.textContent;
    }

    if (existingScript.type) {
      newScript.type = existingScript.type;
    }

    Array.from(existingScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value);
    });

    existingScript.replaceWith(newScript);
  });
};

function getIFrame(isEditing: boolean) {
  if (typeof window === "undefined") return;

  let frameEl: Element | Document | null | undefined = document.querySelector("#preview-frame");

  if (isEditing) {
    return (frameEl as HTMLIFrameElement)!.contentDocument || null;
  }

  return document;
}
