import { ExcelTable } from "@/components/ExcelTable";
import { fetchCompanySettings } from "@/app/actions/settings";

export default async function Home() {
  const settingsData = await fetchCompanySettings();
  const googleDriveConfig = settingsData?.settings?.googleDrive;

  return (
    <main className="flex-1 w-full h-full overflow-hidden">
      <ExcelTable googleDriveConfig={googleDriveConfig as any} />
    </main>
  );
}
