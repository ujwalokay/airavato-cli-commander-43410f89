import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Field, Hint } from "@/components/head/primitives";
import { StatusBadge } from "@/components/head/status-badge";
import { ROLES, PERMISSION_LIST, can } from "@/lib/head-data";
import { useSession } from "@/components/head/session";
import { useSettings, useSaveSettings } from "@/lib/head-db";


export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Platform settings — AiravotoHead" },
      {
        name: "description",
        content: "Platform-wide defaults for AiravotoHead: roles and permissions, grace windows, heartbeat thresholds and audit retention.",
      },
      { property: "og:title", content: "Platform settings — AiravotoHead" },
      { property: "og:description", content: "Roles, grace windows, heartbeat thresholds and audit retention." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const session = useSession();
  const { data: settings, isLoading } = useSettings();
  const save = useSaveSettings({ name: session.name, role: session.role });
  const editable = session.can("settings.write");

  const [form, setForm] = useState({
    grace_period_days: 14,
    heartbeat_interval_min: 15,
    offline_threshold_hours: 48,
    backup_warning_hours: 36,
    rollout_failure_threshold_pct: 5,
    audit_retention_days: 730,
    support_email: "",
    support_phone: "",
    public_booking_default: true,
    notify_email: true,
    notify_in_app: true,
  });

  useEffect(() => {
    if (!settings) return;
    setForm({
      grace_period_days: settings.gracePeriodDays,
      heartbeat_interval_min: settings.heartbeatIntervalMin,
      offline_threshold_hours: settings.offlineThresholdHours,
      backup_warning_hours: settings.backupWarningHours,
      rollout_failure_threshold_pct: settings.rolloutFailureThresholdPct,
      audit_retention_days: settings.auditRetentionDays,
      support_email: settings.supportEmail,
      support_phone: settings.supportPhone,
      public_booking_default: settings.publicBookingDefault,
      notify_email: settings.notifyEmail,
      notify_in_app: settings.notifyInApp,
    });
  }, [settings]);

  const num = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: Number(v) || 0 }));

  return (
    <>
      <PageHeader
        title="Platform settings"
        description="These defaults apply to every cafe tenant. Changes are saved to the platform database and recorded in the audit log."
        actions={
          editable ? (
            <Button
              disabled={save.isPending || isLoading}
              onClick={() =>
                save.mutate(form, {
                  onSuccess: () => toast.success("Platform settings saved"),
                  onError: (e) => toast.error((e as Error).message),
                })
              }
            >
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Operational thresholds</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="hb">Heartbeat interval (minutes)</Label>
              <Input id="hb" type="number" disabled={!editable} value={form.heartbeat_interval_min} onChange={(e) => num("heartbeat_interval_min")(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="off">Offline threshold (hours)</Label>
              <Input id="off" type="number" disabled={!editable} value={form.offline_threshold_hours} onChange={(e) => num("offline_threshold_hours")(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="grace">Licence grace period (days)</Label>
              <Input id="grace" type="number" disabled={!editable} value={form.grace_period_days} onChange={(e) => num("grace_period_days")(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bk">Backup warning (hours)</Label>
              <Input id="bk" type="number" disabled={!editable} value={form.backup_warning_hours} onChange={(e) => num("backup_warning_hours")(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ro">Rollout failure threshold (%)</Label>
              <Input id="ro" type="number" disabled={!editable} value={form.rollout_failure_threshold_pct} onChange={(e) => num("rollout_failure_threshold_pct")(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ar">Audit retention (days)</Label>
              <Input id="ar" type="number" disabled={!editable} value={form.audit_retention_days} onChange={(e) => num("audit_retention_days")(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Field label="Supported versions" value={(settings?.supportedVersions ?? []).join(", ") || "—"} mono />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support and notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="se">Support email</Label>
              <Input id="se" disabled={!editable} value={form.support_email} onChange={(e) => setForm((f) => ({ ...f, support_email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sp">Support phone</Label>
              <Input id="sp" disabled={!editable} value={form.support_phone} onChange={(e) => setForm((f) => ({ ...f, support_phone: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pb">Public booking on by default</Label>
              <Switch id="pb" disabled={!editable} checked={form.public_booking_default} onCheckedChange={(v) => setForm((f) => ({ ...f, public_booking_default: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ne">Email notifications</Label>
              <Switch id="ne" disabled={!editable} checked={form.notify_email} onCheckedChange={(v) => setForm((f) => ({ ...f, notify_email: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ni">In-app notifications</Label>
              <Switch id="ni" disabled={!editable} checked={form.notify_in_app} onCheckedChange={(v) => setForm((f) => ({ ...f, notify_in_app: v }))} />
            </div>
            {!editable && <Hint text="Your role can view platform settings but not change them." />}
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>Your session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="Active role" value={<StatusBadge status={session.role} tone="brand" />} />
            <Field label="Theme" value={session.theme === "dark" ? "Dark" : "Light"} />
            <Field label="Scope" value="All cafes in this platform tenant" />
            <Hint text="Role switching here is a demo control. In production, roles come from your identity provider and cannot be self-assigned." />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Roles and permissions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Permission</th>
                {ROLES.map((r) => (
                  <th key={r.id} className="px-2 py-2 font-medium">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_LIST.map((p) => (
                <tr key={p} className="border-b last:border-0">
                  <td className="py-2 pr-3 font-mono text-xs">{p}</td>
                  {ROLES.map((r) => (
                    <td key={r.id} className="px-2 py-2">
                      {can(r.id, p) ? (
                        <span className="text-ok">Allowed</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}