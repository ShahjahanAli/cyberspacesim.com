-- 02_challenges.sql
-- 4–5 challenges per scenario. Flags stored as SHA-256 hashes via pgcrypto.
-- Plain-text flags (for reference only, never stored): CTF{slug_suffix}

-- ────────────────── 1. Corporate Breach Drill ─────────────────────────────────
INSERT INTO challenges (scenario_id, slug, title, description, type, difficulty, points, flag_hash, hints, hint_cost, order_index, is_required)
SELECT s.id, v.slug, v.title, v.description, v.type, v.difficulty, v.points,
       CASE WHEN v.flag IS NOT NULL THEN encode(digest(v.flag, 'sha256'), 'hex') ELSE NULL END,
       v.hints, v.hint_cost, v.order_index, v.is_required
FROM scenarios s,
LATERAL (VALUES
  ('cbd-recon',          'Network Reconnaissance',       'Enumerate the target subnet. Identify open ports, running services, and OS fingerprints on all reachable hosts.',
   'investigate','Easy',  50,  NULL,                         ARRAY['Try nmap -sV -O','Use -p- for all ports'],           5, 0, true),
  ('cbd-smb-exploit',    'SMB Exploitation',             'Exploit the vulnerable SMBv1 service on 192.168.1.42 to gain initial access. Capture the NT hash of the local admin.',
   'exploit',    'Medium',100, 'CTF{smb_admin_hash_cbd}',    ARRAY['MS17-010 is unpatched','Use Metasploit psexec module'],10, 1, true),
  ('cbd-priv-esc',       'Privilege Escalation',         'You have a limited shell. Escalate to SYSTEM using a kernel exploit or misconfiguration.',
   'exploit',    'Medium',150, NULL,                          ARRAY['Check SeImpersonatePrivilege','PrintSpoofer/JuicyPotato'],15, 2, true),
  ('cbd-lateral-move',   'Lateral Movement',             'Using harvested credentials, pivot from the foothold host to the Domain Controller at 192.168.1.100.',
   'exploit',    'Hard',  175, NULL,                          ARRAY['Pass-the-hash via SMB','Use evil-winrm or psexec'],    15, 3, false),
  ('cbd-data-exfil',     'Data Exfiltration — Flag',    'Locate and exfiltrate the file TARGET_DATA.enc from the file server. Submit the flag inside it.',
   'capture_flag','Hard', 200, 'CTF{exfil_complete_corp_d9f1}',ARRAY['Check \\\\192.168.1.50\\shares','Use certutil to encode the file'],20, 4, true)
) AS v(slug, title, description, type, difficulty, points, flag, hints, hint_cost, order_index, is_required)
WHERE s.slug = 'corporate-breach-drill'
ON CONFLICT (slug) DO NOTHING;

-- ────────────────── 2. Ransomware Containment ─────────────────────────────────
INSERT INTO challenges (scenario_id, slug, title, description, type, difficulty, points, flag_hash, hints, hint_cost, order_index, is_required)
SELECT s.id, v.slug, v.title, v.description, v.type, v.difficulty, v.points,
       CASE WHEN v.flag IS NOT NULL THEN encode(digest(v.flag, 'sha256'), 'hex') ELSE NULL END,
       v.hints, v.hint_cost, v.order_index, v.is_required
FROM scenarios s,
LATERAL (VALUES
  ('rc-patient-zero',   'Identify Patient Zero',      'Correlate SIEM alerts and DHCP logs to identify the first host infected with ransomware.',
   'investigate','Easy',  75, 'CTF{patient_zero_rc_host4}',   ARRAY['Filter SIEM for SMB write events','Look at DHCP lease times'], 10, 0, true),
  ('rc-malware-analyst','Malware Analysis',           'Extract and reverse-engineer the ransomware dropper to identify the encryption key derivation method.',
   'investigate','Medium',125, NULL,                          ARRAY['Use pestudio or Detect-it-Easy','Look for CryptGenKey API calls'],15, 1, false),
  ('rc-isolate-hosts',  'Network Isolation',          'Apply firewall rules to isolate the four affected hosts without taking down the entire network segment.',
   'defend',     'Medium',150, NULL,                          ARRAY['Use VLAN isolation','Block lateral SMB on the segment'],         10, 2, true),
  ('rc-restore-ops',    'Restore Operations',         'Restore encrypted files from backup and verify integrity. Submit the flag found in RECOVERED_DATA.txt.',
   'capture_flag','Hard', 175, 'CTF{ops_restored_rc_88e2}',   ARRAY['Check \\\\backup-srv\\daily_backups','Verify MD5 checksums'],   15, 3, true)
) AS v(slug, title, description, type, difficulty, points, flag, hints, hint_cost, order_index, is_required)
WHERE s.slug = 'ransomware-containment'
ON CONFLICT (slug) DO NOTHING;

-- ────────────────── 3. APT Intrusion Hunt ─────────────────────────────────────
INSERT INTO challenges (scenario_id, slug, title, description, type, difficulty, points, flag_hash, hints, hint_cost, order_index, is_required)
SELECT s.id, v.slug, v.title, v.description, v.type, v.difficulty, v.points,
       CASE WHEN v.flag IS NOT NULL THEN encode(digest(v.flag, 'sha256'), 'hex') ELSE NULL END,
       v.hints, v.hint_cost, v.order_index, v.is_required
FROM scenarios s,
LATERAL (VALUES
  ('apt-initial-ioc',   'Initial IOC Triage',         'Parse threat intel feed and identify which hosts in the environment match known APT28 C2 indicators.',
   'investigate','Easy', 100, 'CTF{apt_ioc_match_3hosts}',    ARRAY['Check DNS logs for known APT28 domains','Correlate with Shodan data'],10, 0, true),
  ('apt-beacon-detect', 'Beacon Detection',            'Identify the Cobalt Strike beacon by analysing network traffic. Find the C2 check-in interval and jitter.',
   'investigate','Medium',175, NULL,                          ARRAY['Look for periodic HTTPS requests','Jitter is typically ±15% of interval'],15,1, true),
  ('apt-lateral-hunt',  'Lateral Movement Hunt',       'Trace the attacker''s lateral movement path from the initial beachhead to the Domain Controller.',
   'investigate','Hard', 250, NULL,                          ARRAY['Enable Sysmon event 3 (network connections)','Use BloodHound for path analysis'],20,2, true),
  ('apt-eject',         'Threat Actor Ejection',       'Remove all persistence mechanisms, revoke stolen credentials, and submit the attacker''s final C2 domain as the flag.',
   'capture_flag','Hard',300, 'CTF{apt_c2_domain_update-cdn}', ARRAY['Check registry RunKeys and scheduled tasks','Look in WMI subscriptions'],25,3, true)
) AS v(slug, title, description, type, difficulty, points, flag, hints, hint_cost, order_index, is_required)
WHERE s.slug = 'apt-intrusion-hunt'
ON CONFLICT (slug) DO NOTHING;

-- ────────────────── 4. Zero-Day Exploitation ──────────────────────────────────
INSERT INTO challenges (scenario_id, slug, title, description, type, difficulty, points, flag_hash, hints, hint_cost, order_index, is_required)
SELECT s.id, v.slug, v.title, v.description, v.type, v.difficulty, v.points,
       CASE WHEN v.flag IS NOT NULL THEN encode(digest(v.flag, 'sha256'), 'hex') ELSE NULL END,
       v.hints, v.hint_cost, v.order_index, v.is_required
FROM scenarios s,
LATERAL (VALUES
  ('zd-vuln-research',  'Vulnerability Research',     'Analyse the CVE advisory and source diff to understand the root cause of the memory corruption.',
   'investigate','Medium',200, NULL,                           ARRAY['Focus on the bounds check in parse_request()','Compare v1.2.3 and v1.2.4 diffs'],20,0, true),
  ('zd-poc-develop',    'Proof-of-Concept',           'Develop a working PoC that achieves reliable code execution against the unpatched target in the lab.',
   'exploit',    'Insane',500, 'CTF{rce_poc_success_zd_f3a9}',ARRAY['Heap spray to control allocator','Leak libc base via info disclosure first'],50,1, true),
  ('zd-persistence',    'Post-Exploitation',          'Establish a persistent backdoor that survives a service restart without touching disk (fileless).',
   'exploit',    'Insane',400, NULL,                           ARRAY['Inject into a long-running process','Use process hollowing'],40,2, false)
) AS v(slug, title, description, type, difficulty, points, flag, hints, hint_cost, order_index, is_required)
WHERE s.slug = 'zero-day-exploitation'
ON CONFLICT (slug) DO NOTHING;

-- ────────────────── 5. Phishing Campaign Sim ──────────────────────────────────
INSERT INTO challenges (scenario_id, slug, title, description, type, difficulty, points, flag_hash, hints, hint_cost, order_index, is_required)
SELECT s.id, v.slug, v.title, v.description, v.type, v.difficulty, v.points,
       CASE WHEN v.flag IS NOT NULL THEN encode(digest(v.flag, 'sha256'), 'hex') ELSE NULL END,
       v.hints, v.hint_cost, v.order_index, v.is_required
FROM scenarios s,
LATERAL (VALUES
  ('ph-osint-recon',    'Target OSINT',               'Use open-source intelligence to build a target list. Find 5 valid corporate email formats and 3 VIP targets.',
   'investigate','Easy',  50, 'CTF{osint_emails_ph_5+3}',     ARRAY['LinkedIn scraping','Hunter.io for email format'],5,  0, true),
  ('ph-lure-craft',     'Lure Creation',              'Craft a convincing spearphishing email impersonating IT helpdesk with a plausible pretext.',
   'configure',  'Easy',  75, NULL,                           ARRAY['Match the company email signature','Use urgency + authority'],5,  1, true),
  ('ph-payload-embed',  'Payload Embedding',          'Embed a credential-harvesting payload in a weaponised Office document with macro execution.',
   'exploit',    'Medium',125, NULL,                           ARRAY['VBA AutoOpen macro','Invoke-WebRequest to your C2'],10, 2, false),
  ('ph-click-rate',     'Campaign Analysis',          'Launch the campaign and capture credentials. Submit the flag embedded in the credential dump.',
   'capture_flag','Medium',150,'CTF{creds_harvested_ph_c7d2}', ARRAY['Check GoPhish dashboard','Flag is in base64 encoded exfil'],10, 3, true)
) AS v(slug, title, description, type, difficulty, points, flag, hints, hint_cost, order_index, is_required)
WHERE s.slug = 'phishing-campaign-sim'
ON CONFLICT (slug) DO NOTHING;

-- ────────────────── 6. Digital Forensics Lab ──────────────────────────────────
INSERT INTO challenges (scenario_id, slug, title, description, type, difficulty, points, flag_hash, hints, hint_cost, order_index, is_required)
SELECT s.id, v.slug, v.title, v.description, v.type, v.difficulty, v.points,
       CASE WHEN v.flag IS NOT NULL THEN encode(digest(v.flag, 'sha256'), 'hex') ELSE NULL END,
       v.hints, v.hint_cost, v.order_index, v.is_required
FROM scenarios s,
LATERAL (VALUES
  ('df-disk-triage',    'Disk Image Triage',          'Mount the provided E01 disk image and identify the attacker''s primary tool installation path.',
   'investigate','Easy', 75,  'CTF{tool_path_df_usr_temp}',  ARRAY['Use Autopsy or FTK Imager','Search for .exe in %TEMP%'],10, 0, true),
  ('df-memory-dump',    'Memory Forensics',           'Analyse the memory dump with Volatility3. Identify the malicious process and extract the injected shellcode.',
   'investigate','Medium',150, NULL,                          ARRAY['volatility3 windows.pstree','Use malfind plugin'],15, 1, true),
  ('df-pcap-analysis',  'Network Capture Analysis',   'Parse the PCAP file to reconstruct the C2 session. Find the encryption key sent in plaintext during the handshake.',
   'investigate','Medium',175, 'CTF{c2_key_df_0xDEADBEEF}',  ARRAY['Filter by attacker IP','Look in TLS Client Hello extensions'],15, 2, true),
  ('df-timeline',       'Attack Timeline',            'Reconstruct the complete attack timeline from initial access to data exfiltration. Submit the ISO timestamp of first execution.',
   'capture_flag','Hard', 200, 'CTF{first_exec_df_2024T02:14}',ARRAY['Correlate disk MFT timestamps','Check Prefetch files'],20, 3, true)
) AS v(slug, title, description, type, difficulty, points, flag, hints, hint_cost, order_index, is_required)
WHERE s.slug = 'digital-forensics-lab'
ON CONFLICT (slug) DO NOTHING;

-- ────────────────── 7. Cryptographic Weaknesses ───────────────────────────────
INSERT INTO challenges (scenario_id, slug, title, description, type, difficulty, points, flag_hash, hints, hint_cost, order_index, is_required)
SELECT s.id, v.slug, v.title, v.description, v.type, v.difficulty, v.points,
       CASE WHEN v.flag IS NOT NULL THEN encode(digest(v.flag, 'sha256'), 'hex') ELSE NULL END,
       v.hints, v.hint_cost, v.order_index, v.is_required
FROM scenarios s,
LATERAL (VALUES
  ('cw-tls-downgrade',  'TLS Downgrade Attack',       'Force the target server to negotiate TLS 1.0 and capture the session key using POODLE.',
   'exploit',    'Medium',150, 'CTF{tls_downgrade_cw_padded}', ARRAY['Use sslstrip','Disable TLS 1.2+ on your client'],15, 0, true),
  ('cw-padding-oracle', 'Padding Oracle Attack',      'Exploit the CBC padding oracle in the login endpoint to decrypt the session cookie without knowing the key.',
   'exploit',    'Hard',  250, 'CTF{padding_oracle_cw_2026}',  ARRAY['Use padbuster tool','Look for 500 vs 403 response codes'],25, 1, true),
  ('cw-jwt-forgery',    'JWT Algorithm Confusion',    'Forge a JWT with admin claims by exploiting the algorithm confusion (RS256 → HS256) vulnerability.',
   'exploit',    'Hard',  300, 'CTF{jwt_admin_cw_forged}',     ARRAY['Decode the JWT header first','Use the RS256 public key as HS256 secret'],25, 2, true)
) AS v(slug, title, description, type, difficulty, points, flag, hints, hint_cost, order_index, is_required)
WHERE s.slug = 'cryptographic-weaknesses'
ON CONFLICT (slug) DO NOTHING;

-- ────────────────── 8. Insider Threat Detection ───────────────────────────────
INSERT INTO challenges (scenario_id, slug, title, description, type, difficulty, points, flag_hash, hints, hint_cost, order_index, is_required)
SELECT s.id, v.slug, v.title, v.description, v.type, v.difficulty, v.points,
       CASE WHEN v.flag IS NOT NULL THEN encode(digest(v.flag, 'sha256'), 'hex') ELSE NULL END,
       v.hints, v.hint_cost, v.order_index, v.is_required
FROM scenarios s,
LATERAL (VALUES
  ('it-log-baseline',   'Establish Baseline',         'Analyse 30 days of authentication logs to build a normal behaviour baseline for all privileged users.',
   'investigate','Easy',  75, NULL,                           ARRAY['Focus on off-hours logins','Calculate average daily access count'],10, 0, true),
  ('it-ueba-alert',     'UEBA Alert Triage',          'Three UEBA alerts fired today. Correlate them with email metadata and file access logs to identify the guilty account.',
   'investigate','Medium',150, 'CTF{insider_user_it_j.smith}', ARRAY['Cross-reference with HR offboarding list','Look for bulk file downloads'],15, 1, true),
  ('it-dlp-trace',      'DLP Event Trace',            'Trace where the exfiltrated data went. Identify the external email address the insider used.',
   'investigate','Medium',175, 'CTF{exfil_dest_it_drop@pm.me}',ARRAY['Check outbound SMTP DLP policy hits','Look in mail gateway logs'],15, 2, true),
  ('it-contain',        'Containment & Evidence',     'Preserve forensic evidence, revoke the insider''s access, and submit the SHA-256 of the exfiltrated file.',
   'capture_flag','Hard', 225, 'CTF{file_hash_it_4a9e2c}',    ARRAY['Hash the file before wiping','Preserve chain of custody log'],20, 3, true)
) AS v(slug, title, description, type, difficulty, points, flag, hints, hint_cost, order_index, is_required)
WHERE s.slug = 'insider-threat-detection'
ON CONFLICT (slug) DO NOTHING;
