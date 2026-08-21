import { createFileRoute } from "@tanstack/react-router";
import { query } from "@/lib/render-db.server";

const TABLES = [
  "cafes",
  "installations",
  "licenses",
  "sync_events",
  "support_incidents",
  "software_releases",
  "audit_logs",
  "heartbeats",
  "platform_settings",
] as const;

export const Route = createFileRoute("/api/platform/snapshot")({
  server: {
    handlers: {
      GET: async () => {
        const [
          cafes,
          installations,
          licenses,
          syncEvents,
          incidents,
          releases,
          auditLogs,
          heartbeats,
          settings,
        ] = await Promise.all([
          query(`SELECT * FROM public.cafes ORDER BY created_at DESC`),
          query(`SELECT * FROM public.installations ORDER BY created_at DESC`),
          query(`SELECT * FROM public.licenses ORDER BY created_at DESC`),
          query(`SELECT * FROM public.sync_events ORDER BY created_at DESC LIMIT 1000`),
          query(`SELECT * FROM public.support_incidents ORDER BY opened_at DESC LIMIT 500`),
          query(`SELECT * FROM public.software_releases ORDER BY created_at DESC`),
          query(`SELECT * FROM public.audit_logs ORDER BY at DESC LIMIT 1000`),
          query(
            `SELECT * FROM public.heartbeats WHERE at >= now() - interval '24 hours' ORDER BY at ASC`,
          ),
          query(`SELECT * FROM public.platform_settings WHERE id = 1 LIMIT 1`),
        ]);

        return Response.json({
          cafes: cafes.rows,
          installations: installations.rows,
          licenses: licenses.rows,
          sync_events: syncEvents.rows,
          support_incidents: incidents.rows,
          software_releases: releases.rows,
          audit_logs: auditLogs.rows,
          heartbeats: heartbeats.rows,
          platform_settings: settings.rows[0] ?? null,
          tables: TABLES,
        });
      },
    },
  },
});
