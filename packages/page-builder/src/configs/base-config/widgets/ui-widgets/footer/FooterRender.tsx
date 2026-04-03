import type { IFooterRenderProps } from "./FooterConfig";
import { DropZone } from "@measured/puck";

export function FooterRender(props: Readonly<IFooterRenderProps & { hasDropZoneDisabled?: boolean }>) {
  return (
    <footer className="bg-footerBgColor text-footerPrimaryTextColor no-print mt-auto" key={props.id}>
      <DropZone zone="footer" />
    </footer>
  );
}
