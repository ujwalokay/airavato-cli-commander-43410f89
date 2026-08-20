
-- Demo seed data
INSERT INTO public.cafes (id, name, legal_name, slug, address, city, state, timezone, currency, owner_name, owner_email, owner_phone, plan, license_state, public_state, pos_version, booking_enabled, profile_completion, description, amenities, devices, bookings_30d, active_sessions, inventory_items, staff, page_visits_30d, seat_limit, installation_limit) VALUES
('11111111-1111-4111-8111-000000000001','Pixel Arena','Pixel Arena Entertainment LLP','pixel-arena','12 MG Road','Bengaluru','Karnataka','Asia/Kolkata','INR','Rahul Menon','rahul@pixelarena.in','+91 98450 11223','Pro','Active','Published','3.4.2',true,96,'Flagship 60-seat esports lounge with RTX rigs.','{"RTX 4070","Console Zone","Cafe","Parking"}',48,412,23,186,9,3120,60,4),
('11111111-1111-4111-8111-000000000002','Nova LAN','Nova Gaming Pvt Ltd','nova-lan','7 Anna Salai','Chennai','Tamil Nadu','Asia/Kolkata','INR','Divya Raman','divya@novalan.in','+91 98400 55441','Starter','Trial','Draft','3.4.0',false,54,'Neighbourhood LAN centre, 20 seats.','{"Snacks","AC"}',20,0,4,64,3,180,40,2),
('11111111-1111-4111-8111-000000000003','Byte Bunker','Byte Bunker Ventures','byte-bunker','44 Linking Road','Mumbai','Maharashtra','Asia/Kolkata','INR','Farhan Shaikh','farhan@bytebunker.in','+91 98200 77123','Pro','Grace','Published','3.3.6',true,88,'24x7 gaming and streaming hub.','{"Streaming Booth","Cafe","Lockers"}',36,268,17,142,7,2410,50,3),
('11111111-1111-4111-8111-000000000004','Respawn Point','Respawn Hospitality','respawn-point','9 Sector 29','Gurugram','Haryana','Asia/Kolkata','INR','Ankit Sharma','ankit@respawnpoint.in','+91 99100 22119','Enterprise','Active','Published','3.4.2',true,100,'Tournament-grade venue with broadcast room.','{"Broadcast Room","VR","Cafe","Parking"}',72,690,41,320,14,5210,80,6),
('11111111-1111-4111-8111-000000000005','Frag Factory','Frag Factory Co','frag-factory','21 Banjara Hills','Hyderabad','Telangana','Asia/Kolkata','INR','Sneha Reddy','sneha@fragfactory.in','+91 90000 33445','Starter','Suspended','Suspended','3.3.6',false,71,'Budget-friendly 24-seat cafe.','{"Snacks"}',24,58,0,71,4,640,40,2),
('11111111-1111-4111-8111-000000000006','Cache Zone','Cache Zone LLP','cache-zone','3 Park Street','Kolkata','West Bengal','Asia/Kolkata','INR','Arjun Bose','arjun@cachezone.in','+91 98300 66778','Pro','Active','Published','3.4.2',true,82,'Retro plus modern gaming lounge.','{"Retro Consoles","Cafe"}',30,201,11,118,6,1740,45,3);

INSERT INTO public.licenses (cafe_id, plan, state, start_date, renewal_date, grace_ends, installation_limit, device_limit, features, token_version, last_validation, suspension_reason, reactivations) VALUES
('11111111-1111-4111-8111-000000000001','Pro','Active',now()-interval '280 days',now()+interval '85 days',NULL,4,60,'{"Booking","Inventory","Analytics"}',3,now()-interval '2 hours',NULL,0),
('11111111-1111-4111-8111-000000000002','Starter','Trial',now()-interval '9 days',now()+interval '5 days',NULL,2,40,'{"Booking"}',1,now()-interval '5 hours',NULL,0),
('11111111-1111-4111-8111-000000000003','Pro','Grace',now()-interval '400 days',now()-interval '4 days',now()+interval '10 days',3,50,'{"Booking","Inventory"}',5,now()-interval '1 day',NULL,1),
('11111111-1111-4111-8111-000000000004','Enterprise','Active',now()-interval '520 days',now()+interval '200 days',NULL,6,80,'{"Booking","Inventory","Analytics","Multi-venue","Priority Support"}',7,now()-interval '35 minutes',NULL,0),
('11111111-1111-4111-8111-000000000005','Starter','Suspended',now()-interval '210 days',now()-interval '30 days',now()-interval '16 days',2,40,'{"Booking"}',2,now()-interval '18 days','Payment failed for two consecutive cycles',2),
('11111111-1111-4111-8111-000000000006','Pro','Active',now()-interval '150 days',now()+interval '30 days',NULL,3,45,'{"Booking","Inventory","Analytics"}',2,now()-interval '6 hours',NULL,0);

INSERT INTO public.installations (id, cafe_id, machine_name, app_version, service_version, os, last_heartbeat, last_backup, backup_ok, sync_queue, token_state, ring, mode, clock_drift_ms, disk_free_gb, latency_ms, db_readable, db_writable, local_api_ok, migration_state, registration_code, registered_at) VALUES
('INST-PXA-01','11111111-1111-4111-8111-000000000001','PXA-FRONTDESK','3.4.2','3.4.2','Windows 11 Pro',now()-interval '3 minutes',now()-interval '6 hours',true,0,'Valid','Stable','Cloud sync',120,214,38,true,true,true,'Up to date','PXA-8891',now()-interval '280 days'),
('INST-PXA-02','11111111-1111-4111-8111-000000000001','PXA-BACKOFFICE','3.4.2','3.4.2','Windows 11 Pro',now()-interval '11 minutes',now()-interval '7 hours',true,4,'Valid','Stable','Cloud sync',260,168,44,true,true,true,'Up to date','PXA-8892',now()-interval '210 days'),
('INST-NVL-01','11111111-1111-4111-8111-000000000002','NOVA-DESK','3.4.0','3.4.0','Windows 10',now()-interval '2 hours',now()-interval '40 hours',false,12,'Valid','Pilot','Local only',900,64,110,true,true,true,'Pending','NVL-2210',now()-interval '9 days'),
('INST-BYB-01','11111111-1111-4111-8111-000000000003','BYTE-MAIN','3.3.6','3.3.6','Windows 11',now()-interval '55 hours',now()-interval '3 days',false,37,'Expiring','Stable','Local only',2400,22,0,true,false,false,'Behind','BYB-4415',now()-interval '400 days'),
('INST-BYB-02','11111111-1111-4111-8111-000000000003','BYTE-STREAM','3.4.0','3.4.0','Windows 11',now()-interval '20 minutes',now()-interval '9 hours',true,2,'Valid','Pilot','Cloud sync',340,98,52,true,true,true,'Up to date','BYB-4416',now()-interval '190 days'),
('INST-RSP-01','11111111-1111-4111-8111-000000000004','RSP-OPS-01','3.4.2','3.4.2','Windows 11 Pro',now()-interval '1 minute',now()-interval '4 hours',true,0,'Valid','Stable','Cloud sync',60,410,28,true,true,true,'Up to date','RSP-1001',now()-interval '520 days'),
('INST-RSP-02','11111111-1111-4111-8111-000000000004','RSP-OPS-02','3.4.2','3.4.2','Windows 11 Pro',now()-interval '4 minutes',now()-interval '4 hours',true,1,'Valid','Stable','Cloud sync',75,388,31,true,true,true,'Up to date','RSP-1002',now()-interval '480 days'),
('INST-FRF-01','11111111-1111-4111-8111-000000000005','FRAG-DESK','3.3.6','3.3.6','Windows 10',now()-interval '19 days',now()-interval '21 days',false,58,'Revoked','Stable','Local only',5400,11,0,true,true,false,'Behind','FRF-7788',now()-interval '210 days'),
('INST-CHZ-01','11111111-1111-4111-8111-000000000006','CACHE-MAIN','3.4.2','3.4.2','Windows 11',now()-interval '8 minutes',now()-interval '10 hours',true,3,'Valid','Stable','Cloud sync',180,142,47,true,true,true,'Up to date','CHZ-3321',now()-interval '150 days');

UPDATE public.installations SET revoked_at = now() - interval '18 days' WHERE id = 'INST-FRF-01';

INSERT INTO public.heartbeats (installation_id, cafe_id, at, app_version, sync_queue, healthy) VALUES
('INST-PXA-01','11111111-1111-4111-8111-000000000001',now()-interval '3 minutes','3.4.2',0,true),
('INST-PXA-01','11111111-1111-4111-8111-000000000001',now()-interval '18 minutes','3.4.2',1,true),
('INST-PXA-02','11111111-1111-4111-8111-000000000001',now()-interval '11 minutes','3.4.2',4,true),
('INST-NVL-01','11111111-1111-4111-8111-000000000002',now()-interval '2 hours','3.4.0',12,false),
('INST-BYB-01','11111111-1111-4111-8111-000000000003',now()-interval '55 hours','3.3.6',37,false),
('INST-BYB-02','11111111-1111-4111-8111-000000000003',now()-interval '20 minutes','3.4.0',2,true),
('INST-RSP-01','11111111-1111-4111-8111-000000000004',now()-interval '1 minute','3.4.2',0,true),
('INST-RSP-02','11111111-1111-4111-8111-000000000004',now()-interval '4 minutes','3.4.2',1,true),
('INST-CHZ-01','11111111-1111-4111-8111-000000000006',now()-interval '8 minutes','3.4.2',3,true);

INSERT INTO public.sync_events (cafe_id, installation_id, entity, operation, retries, last_error, state, protected_entity, resolution_reason) VALUES
('11111111-1111-4111-8111-000000000001','INST-PXA-02','Session','update',0,NULL,'Queued',false,NULL),
('11111111-1111-4111-8111-000000000001','INST-PXA-02','Invoice','create',1,'Timeout contacting cloud','Retrying',true,NULL),
('11111111-1111-4111-8111-000000000002','INST-NVL-01','InventoryItem','update',3,'409 Conflict on stock_count','Conflict',false,NULL),
('11111111-1111-4111-8111-000000000003','INST-BYB-01','Booking','create',5,'Token expired','Failed',true,NULL),
('11111111-1111-4111-8111-000000000003','INST-BYB-01','Session','delete',4,'Token expired','Failed',false,NULL),
('11111111-1111-4111-8111-000000000003','INST-BYB-02','Customer','update',0,NULL,'Queued',false,NULL),
('11111111-1111-4111-8111-000000000004','INST-RSP-02','Invoice','create',0,NULL,'Synced',true,'Auto-resolved on reconnect'),
('11111111-1111-4111-8111-000000000005','INST-FRF-01','Session','create',8,'License revoked','Failed',false,NULL),
('11111111-1111-4111-8111-000000000006','INST-CHZ-01','InventoryItem','create',0,NULL,'Queued',false,NULL),
('11111111-1111-4111-8111-000000000006','INST-CHZ-01','Booking','update',2,'Network unreachable','Retrying',false,NULL);

INSERT INTO public.software_releases (version, channel, notes, migration_range, published_at, rollout_pct, failed_installs, rollback_available, ring) VALUES
('3.4.3','Beta','Offline booking cache and faster sync batching.','214 -> 219',NULL,0,0,true,'Internal'),
('3.4.2','Stable','Stability fixes for heartbeat retries and backup scheduler.','208 -> 214',now()-interval '21 days',100,2,true,'Stable'),
('3.4.0','Stable','New inventory module and license token v3.','198 -> 208',now()-interval '76 days',100,6,true,'Stable'),
('3.3.6','Stable','Security patch for local API auth.','190 -> 198',now()-interval '160 days',100,1,false,'Stable');

INSERT INTO public.support_incidents (cafe_id, installation_id, kind, severity, status, summary, opened_at, resolved_at) VALUES
('11111111-1111-4111-8111-000000000003','INST-BYB-01','Offline','Critical','Open','Installation offline for 55 hours, sync queue at 37.',now()-interval '2 days',NULL),
('11111111-1111-4111-8111-000000000003','INST-BYB-01','Backup','Warning','Acknowledged','No successful backup in 3 days.',now()-interval '3 days',NULL),
('11111111-1111-4111-8111-000000000005','INST-FRF-01','License','Critical','Open','License suspended after failed payments; installation revoked.',now()-interval '18 days',NULL),
('11111111-1111-4111-8111-000000000002','INST-NVL-01','Sync','Warning','Open','Inventory conflict pending manual resolution.',now()-interval '6 hours',NULL),
('11111111-1111-4111-8111-000000000001','INST-PXA-02','Sync','Info','Resolved','Transient invoice sync retry cleared automatically.',now()-interval '9 days',now()-interval '9 days'+interval '40 minutes'),
('11111111-1111-4111-8111-000000000006','INST-CHZ-01','Backup','Info','Resolved','Backup scheduler re-enabled after upgrade.',now()-interval '15 days',now()-interval '14 days');

INSERT INTO public.audit_logs (at, actor, actor_role, action, target_type, target_id, cafe_id, cafe_name, reason, before_summary, after_summary, context, result) VALUES
(now()-interval '35 minutes','priya@airavoto.com','Operations','License renewed','License','11111111-1111-4111-8111-000000000004','11111111-1111-4111-8111-000000000004','Respawn Point','Annual renewal processed','Renewal 2026-08-16','Renewal 2027-03-06','Billing console','Success'),
(now()-interval '2 hours','system','system','Heartbeat threshold breached','Installation','INST-BYB-01','11111111-1111-4111-8111-000000000003','Byte Bunker','Offline beyond 48h threshold','Online','Offline','Monitoring','Success'),
(now()-interval '6 hours','arun@airavoto.com','Support','Sync conflict escalated','SyncEvent','INST-NVL-01','11111111-1111-4111-8111-000000000002','Nova LAN','Stock count mismatch','Retrying','Conflict','Support console','Success'),
(now()-interval '1 day','priya@airavoto.com','Operations','Grace period started','License','11111111-1111-4111-8111-000000000003','11111111-1111-4111-8111-000000000003','Byte Bunker','Renewal date passed','Active','Grace','Automation','Success'),
(now()-interval '3 days','meera@airavoto.com','Admin','Rollout advanced','Release','3.4.2',NULL,NULL,'Failure rate under threshold','Rollout 50%','Rollout 100%','Release manager','Success'),
(now()-interval '18 days','meera@airavoto.com','Admin','License suspended','License','11111111-1111-4111-8111-000000000005','11111111-1111-4111-8111-000000000005','Frag Factory','Payment failed twice','Active','Suspended','Billing console','Success'),
(now()-interval '18 days','system','system','Installation token revoked','Installation','INST-FRF-01','11111111-1111-4111-8111-000000000005','Frag Factory','License suspended','Valid','Revoked','Automation','Success'),
(now()-interval '9 days','ujwal@airavoto.com','Admin','Cafe published','Cafe','11111111-1111-4111-8111-000000000006','11111111-1111-4111-8111-000000000006','Cache Zone','Profile completed','Draft','Published','Cafe profile','Success'),
(now()-interval '21 days','meera@airavoto.com','Admin','Release published','Release','3.4.2',NULL,NULL,'Stable channel promotion','Beta','Stable','Release manager','Success'),
(now()-interval '5 days','arun@airavoto.com','Support','Settings updated','Settings','platform',NULL,NULL,'Tuned offline alerting','Offline threshold 72h','Offline threshold 48h','Platform settings','Success');
