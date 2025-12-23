// count-down-timer-app/ app / routes/app.jsx
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider as AppBridgeProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";

import { Frame } from "@shopify/polaris";

/* ---------------- Loader ---------------- */
export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return { apiKey: import.meta.env.VITE_SHOPIFY_API_KEY || "" };
};

/* ---------------- App Root ---------------- */
export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppBridgeProvider embedded apiKey={apiKey}>
      <PolarisProvider i18n={{}}>
        <Frame>
          <s-app-nav>
            <s-link href="/app">Home</s-link>
            <s-link href="/app/additional">Additional page</s-link>
          </s-app-nav>

          <Outlet />
        </Frame>
      </PolarisProvider>
    </AppBridgeProvider>
  );
}

/* ---------------- Error Boundary ---------------- */
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

/* ---------------- Headers ---------------- */
export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

/* ---------------- Polaris Styles ---------------- */
export function links() {
  return [{ rel: "stylesheet", href: polarisStyles }];
}