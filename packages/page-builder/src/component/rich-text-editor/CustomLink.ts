export default function createCustomLink(Inline: any) {
  class CustomLink extends Inline {
    static blotName = "link";
    static tagName = "A";
    static className = "custom-link";

    static create(value: any) {
      const node = super.create(value);
      node.setAttribute("href", value.href || value);
      if (value.target) {
        node.setAttribute("target", value.target);
      } else {
        node.removeAttribute("target");
      }
      return node;
    }

    static formats(domNode: HTMLElement) {
      return {
        href: domNode.getAttribute("href"),
        target: domNode.getAttribute("target") ?? "",
      };
    }

    format(name: string, value: any) {
      if (name === "link" && value && typeof value === "object") {
        if (value.href) {
          this.domNode.setAttribute("href", value.href);
        }
        if (value.target) {
          this.domNode.setAttribute("target", value.target);
        } else {
          this.domNode.removeAttribute("target");
        }
      } else {
        super.format(name, value);
      }
    }
  }

  return CustomLink;
}
