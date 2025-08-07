import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { SettingsPage } from "@/components/features/Settings";
import SecureErrorBoundary from "@/components/shared/SecureErrorBoundary";

export const meta: MetaFunction = () => {
  return [
    { title: "Settings - MarkDown Ultra Editor" },
    {
      name: "description",
      content:
        "Customize your markdown editor experience with themes, writing settings, and account management",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { property: "og:title", content: "Settings - MarkDown Ultra Editor" },
    {
      property: "og:description",
      content:
        "Customize your markdown editor experience with themes, writing settings, and account management",
    },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Settings - MarkDown Ultra Editor" },
    {
      name: "twitter:description",
      content:
        "Customize your markdown editor experience with themes, writing settings, and account management",
    },
  ];
};

export async function loader(_args: LoaderFunctionArgs) {
  return {};
}

/**
 * Main settings route component
 */
export default function SettingsRoute() {
  return (
    <SecureErrorBoundary>
      <SettingsPage />
    </SecureErrorBoundary>
  );
}
