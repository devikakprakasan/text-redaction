import { Card } from "@/components/ui/card";

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-2">
          Welcome
        </h2>

        <p className="text-gray-600">
          This system allows you to redact sensitive information from
          insurance and medical related documents securely.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold">Text Redaction</h3>
          <p className="text-sm text-gray-500">
            Remove personal details from plain text or files
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold">Data Privacy</h3>
          <p className="text-sm text-gray-500">
            Secure handling of sensitive information
          </p>
        </Card>
      </div>
    </div>
  );
}
