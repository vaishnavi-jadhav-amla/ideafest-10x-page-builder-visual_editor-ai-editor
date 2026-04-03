"use client";

import { type Data, Render } from "@measured/puck";
import { getConfig } from "../configs/get-config";
import { IConfigParam } from "../types/page-builder";
import { useLayoutEffect, useState } from "react";
import { extendConfig, IComponents } from "../configs/base-config/config/extend-config";
import { LoadingSpinnerComponent } from "@znode/base-components/common/icons";
import { headerFooterConfig } from "../configs/utils";
import { getThemeComponents } from "../configs/override-mapper";

type PageRenderProps = {
  data: Data;
  configParam: IConfigParam;
};

export function defaultConfigForHomeAndContentPage(configParam: IConfigParam) {
  const isRequestFromPageBuilder = typeof window !== "undefined" ? new URL(window.location.href).searchParams.get("storeCode") : "";
  let selectedConfig = null;
  if (configParam.configType == "common") {
    const addOrOverrideComponents: IComponents = getThemeComponents(configParam.theme) as IComponents;
    selectedConfig = {
      components: {},
      removeComponentKeys: [],
      disabled: false,
      addComponentToCategories: [],
    };
    return extendConfig({
      addOrOverrideComponents: { ...addOrOverrideComponents, ...selectedConfig.components },
      removeComponentKeys: selectedConfig.removeComponentKeys,
      disabled: selectedConfig.disabled,
      addComponentToCategories: selectedConfig.addComponentToCategories,
    });
  }
  if (isRequestFromPageBuilder) {
    return headerFooterConfig(configParam);
  }
  return selectedConfig;
}

export function PageRender(props: Readonly<PageRenderProps>) {
  const { configParam } = props;

  const contentConfig = defaultConfigForHomeAndContentPage(configParam);
  const [config, setConfig] = useState<any>(contentConfig ?? null);
  useLayoutEffect(() => {
    if (contentConfig) return;

    let isMounted = true;
    async function fetchConfig() {
      const loadedConfig = await getConfig(configParam);
      if (isMounted) {
        setConfig(loadedConfig);
      }
    }

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, [configParam, contentConfig]);

  if (!config && !contentConfig) {
    return (
      <div className="h-screen flex items-center justify-center w-full">
        <LoadingSpinnerComponent />
      </div>
    );
  }

  return <Render data={props.data} config={config} />;
}
