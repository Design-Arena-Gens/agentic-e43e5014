import Dashboard from "@/components/dashboard";
import { getConfig } from "@/lib/config-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const config = await getConfig();

  return <Dashboard initialConfig={config} />;
}
