-- 01_scenarios.sql
-- Seed all 8 scenarios matching the frontend scenario list

INSERT INTO scenarios (slug, title, description, difficulty, category, duration, xp_reward, is_locked, tags)
VALUES
  (
    'corporate-breach-drill',
    'Corporate Breach Drill',
    'Infiltrate a simulated corporate network, pivot through services, and exfiltrate target data without triggering IDS alerts.',
    'Beginner', 'Red Team', '30–45 min', 200, false,
    ARRAY['SMB','Pivot','Recon']
  ),
  (
    'ransomware-containment',
    'Ransomware Containment',
    'A ransomware strain is spreading through the network. Identify patient zero, isolate affected hosts, and restore operations.',
    'Intermediate', 'Blue Team', '45–60 min', 400, false,
    ARRAY['Incident Response','Malware','SIEM']
  ),
  (
    'apt-intrusion-hunt',
    'APT Intrusion Hunt',
    'Threat intelligence indicates an Advanced Persistent Threat actor has established a beachhead. Hunt them down and eject them.',
    'Advanced', 'Blue Team', '60–90 min', 700, false,
    ARRAY['Threat Hunting','Lateral Movement','MITRE ATT&CK']
  ),
  (
    'zero-day-exploitation',
    'Zero-Day Exploitation',
    'Weaponise a freshly disclosed vulnerability against a patched-but-misconfigured target. Race the patch cycle.',
    'Expert', 'Red Team', '90–120 min', 1200, true,
    ARRAY['CVE','Exploit Dev','RCE']
  ),
  (
    'phishing-campaign-sim',
    'Phishing Campaign Sim',
    'Craft a realistic phishing campaign targeting three departments. Measure click rates and credential harvesting.',
    'Beginner', 'Social Engineering', '20–30 min', 150, false,
    ARRAY['Phishing','OSINT','Human Factor']
  ),
  (
    'digital-forensics-lab',
    'Digital Forensics Lab',
    'Analyse disk images, memory dumps, and packet captures from a compromised host to reconstruct the attack chain.',
    'Intermediate', 'Forensics', '60–75 min', 500, false,
    ARRAY['Disk Image','Volatility','Wireshark']
  ),
  (
    'cryptographic-weaknesses',
    'Cryptographic Weaknesses',
    'Identify and exploit common cryptographic misconfigurations: weak ciphers, padding oracles, JWT forgery.',
    'Advanced', 'Cryptography', '45–60 min', 600, true,
    ARRAY['TLS','JWT','Padding Oracle']
  ),
  (
    'insider-threat-detection',
    'Insider Threat Detection',
    'A privileged user is leaking data. Use UEBA analytics and log correlation to identify and contain the threat.',
    'Intermediate', 'Blue Team', '40–55 min', 350, false,
    ARRAY['UEBA','DLP','Log Analysis']
  )
ON CONFLICT (slug) DO UPDATE SET
  title       = EXCLUDED.title,
  description = EXCLUDED.description,
  difficulty  = EXCLUDED.difficulty,
  category    = EXCLUDED.category,
  duration    = EXCLUDED.duration,
  xp_reward   = EXCLUDED.xp_reward,
  is_locked   = EXCLUDED.is_locked,
  tags        = EXCLUDED.tags;
