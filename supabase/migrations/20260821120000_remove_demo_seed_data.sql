-- Remove only the demo records created by
-- 20260820104255_83cee83f-09f8-4b09-a231-77445cde1511.sql.
-- Real cafes and POS installations are not affected.

DO $$
DECLARE
  demo_cafe_ids uuid[] := ARRAY[
    '11111111-1111-4111-8111-000000000001'::uuid,
    '11111111-1111-4111-8111-000000000002'::uuid,
    '11111111-1111-4111-8111-000000000003'::uuid,
    '11111111-1111-4111-8111-000000000004'::uuid,
    '11111111-1111-4111-8111-000000000005'::uuid,
    '11111111-1111-4111-8111-000000000006'::uuid
  ];
BEGIN
  DELETE FROM public.audit_logs
  WHERE cafe_id = ANY (demo_cafe_ids)
     OR target_id IN ('INST-PXA-01', 'INST-PXA-02', 'INST-NVL-01', 'INST-BYB-01', 'INST-BYB-02', 'INST-RSP-01', 'INST-RSP-02', 'INST-FRF-01', 'INST-CHZ-01')
     OR (target_type = 'Release' AND target_id IN ('3.4.3', '3.4.2', '3.4.0', '3.3.6') AND context = 'Release manager')
     OR (target_type = 'Settings' AND target_id = 'platform' AND context = 'Platform settings' AND actor = 'arun@airavoto.com');

  DELETE FROM public.software_releases
  WHERE (version, notes) IN (
    ('3.4.3', 'Offline booking cache and faster sync batching.'),
    ('3.4.2', 'Stability fixes for heartbeat retries and backup scheduler.'),
    ('3.4.0', 'New inventory module and license token v3.'),
    ('3.3.6', 'Security patch for local API auth.')
  );

  DELETE FROM public.cafes
  WHERE id = ANY (demo_cafe_ids)
    AND slug IN ('pixel-arena', 'nova-lan', 'byte-bunker', 'respawn-point', 'frag-factory', 'cache-zone');
END $$;
