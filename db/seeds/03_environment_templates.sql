-- 03_environment_templates.sql
-- Network topology templates for simulated environments

INSERT INTO environment_templates (slug, name, description, scenario_id, topology)
VALUES
  -- ── Corporate Network ──────────────────────────────────────────────────────
  (
    'corporate-network',
    'Corporate Network',
    'A typical SMB corporate network with gateway, web/file servers, domain controller, and workstations. Used for red team exercises.',
    (SELECT id FROM scenarios WHERE slug = 'corporate-breach-drill'),
    '{
      "nodes": [
        {
          "key": "attacker",
          "label": "Attacker Box",
          "type": "attacker",
          "ip": "10.10.0.5",
          "os": "Kali Linux 2024",
          "status": "online",
          "services": ["SSH:22","HTTP:80"],
          "vulnerabilities": []
        },
        {
          "key": "gateway",
          "label": "Edge Gateway",
          "type": "router",
          "ip": "192.168.1.1",
          "os": "Cisco IOS",
          "status": "online",
          "services": ["DHCP","NAT","Firewall"],
          "vulnerabilities": []
        },
        {
          "key": "dmz-web",
          "label": "Web Server (DMZ)",
          "type": "server",
          "ip": "192.168.1.10",
          "os": "Ubuntu 20.04",
          "status": "online",
          "services": ["HTTP:80","HTTPS:443","SSH:22"],
          "vulnerabilities": ["CVE-2021-41773","Outdated PHP 7.2"]
        },
        {
          "key": "smb-server",
          "label": "File Server",
          "type": "server",
          "ip": "192.168.1.42",
          "os": "Windows Server 2008 R2",
          "status": "online",
          "services": ["SMB:445","RDP:3389"],
          "vulnerabilities": ["MS17-010 (EternalBlue)","Weak SMB signing"]
        },
        {
          "key": "dc",
          "label": "Domain Controller",
          "type": "server",
          "ip": "192.168.1.100",
          "os": "Windows Server 2019",
          "status": "online",
          "services": ["LDAP:389","LDAPS:636","Kerberos:88","DNS:53"],
          "vulnerabilities": []
        },
        {
          "key": "ws-01",
          "label": "Workstation HR-01",
          "type": "workstation",
          "ip": "192.168.1.201",
          "os": "Windows 10 21H2",
          "status": "online",
          "services": ["RDP:3389"],
          "vulnerabilities": ["Unpatched MS Office"]
        },
        {
          "key": "ws-02",
          "label": "Workstation HR-02",
          "type": "workstation",
          "ip": "192.168.1.202",
          "os": "Windows 10 21H2",
          "status": "online",
          "services": ["RDP:3389"],
          "vulnerabilities": []
        }
      ],
      "connections": [
        {"from": "attacker", "to": "gateway", "protocol": "TCP"},
        {"from": "gateway",  "to": "dmz-web", "protocol": "TCP"},
        {"from": "gateway",  "to": "smb-server", "protocol": "SMB"},
        {"from": "gateway",  "to": "dc", "protocol": "TCP"},
        {"from": "dc",       "to": "ws-01", "protocol": "RDP"},
        {"from": "dc",       "to": "ws-02", "protocol": "RDP"},
        {"from": "smb-server","to": "dc", "protocol": "Kerberos"}
      ]
    }'::jsonb
  ),

  -- ── Enterprise SOC ─────────────────────────────────────────────────────────
  (
    'enterprise-soc',
    'Enterprise SOC',
    'A Security Operations Centre environment with SIEM, endpoint agents, mail gateway, and DMZ. Used for blue team and forensics exercises.',
    (SELECT id FROM scenarios WHERE slug = 'apt-intrusion-hunt'),
    '{
      "nodes": [
        {
          "key": "siem",
          "label": "SIEM (Elastic Stack)",
          "type": "server",
          "ip": "10.0.0.10",
          "os": "Ubuntu 22.04",
          "status": "online",
          "services": ["Kibana:5601","Elasticsearch:9200","Logstash:5044"],
          "vulnerabilities": []
        },
        {
          "key": "mail-gw",
          "label": "Mail Gateway",
          "type": "server",
          "ip": "10.0.0.20",
          "os": "Postfix/Amavis",
          "status": "online",
          "services": ["SMTP:25","IMAPS:993","SpamAssassin"],
          "vulnerabilities": ["Open relay misconfiguration"]
        },
        {
          "key": "dmz-proxy",
          "label": "Reverse Proxy (DMZ)",
          "type": "server",
          "ip": "10.0.0.30",
          "os": "nginx 1.18",
          "status": "online",
          "services": ["HTTP:80","HTTPS:443"],
          "vulnerabilities": []
        },
        {
          "key": "edr-mgmt",
          "label": "EDR Management Console",
          "type": "server",
          "ip": "10.0.0.40",
          "os": "Windows Server 2022",
          "status": "online",
          "services": ["HTTPS:8443","WMI:135"],
          "vulnerabilities": []
        },
        {
          "key": "endpoint-01",
          "label": "Analyst Workstation A",
          "type": "workstation",
          "ip": "10.0.1.11",
          "os": "Windows 11",
          "status": "online",
          "services": ["RDP:3389"],
          "vulnerabilities": []
        },
        {
          "key": "endpoint-02",
          "label": "Dev Workstation (Compromised)",
          "type": "workstation",
          "ip": "10.0.1.22",
          "os": "Windows 10",
          "status": "compromised",
          "services": ["RDP:3389"],
          "vulnerabilities": ["Cobalt Strike beacon active"]
        },
        {
          "key": "nta",
          "label": "Network Traffic Analyser",
          "type": "server",
          "ip": "10.0.0.50",
          "os": "Ubuntu 22.04 / Zeek",
          "status": "online",
          "services": ["Zeek","Suricata"],
          "vulnerabilities": []
        }
      ],
      "connections": [
        {"from": "dmz-proxy",    "to": "mail-gw",  "protocol": "SMTP"},
        {"from": "mail-gw",      "to": "endpoint-02","protocol": "IMAP"},
        {"from": "endpoint-02",  "to": "siem",     "protocol": "Syslog"},
        {"from": "endpoint-01",  "to": "siem",     "protocol": "Syslog"},
        {"from": "edr-mgmt",     "to": "endpoint-01","protocol": "WMI"},
        {"from": "edr-mgmt",     "to": "endpoint-02","protocol": "WMI"},
        {"from": "nta",          "to": "siem",     "protocol": "Syslog"},
        {"from": "endpoint-02",  "to": "dmz-proxy","protocol": "HTTPS","note":"C2 beacon"}
      ]
    }'::jsonb
  ),

  -- ── Air-Gapped Lab ─────────────────────────────────────────────────────────
  (
    'air-gapped-lab',
    'Air-Gapped Research Lab',
    'An isolated research network with no direct internet connectivity. Used for advanced cryptography and zero-day development exercises.',
    (SELECT id FROM scenarios WHERE slug = 'cryptographic-weaknesses'),
    '{
      "nodes": [
        {
          "key": "jump-host",
          "label": "Jump Host (Transfer Zone)",
          "type": "server",
          "ip": "172.16.0.1",
          "os": "Debian 12",
          "status": "online",
          "services": ["SSH:22","SFTP"],
          "vulnerabilities": []
        },
        {
          "key": "crypto-lab",
          "label": "Crypto Research Server",
          "type": "server",
          "ip": "172.16.1.10",
          "os": "Ubuntu 22.04",
          "status": "online",
          "services": ["HTTPS:443","Custom RPC:8080"],
          "vulnerabilities": ["Weak TLS 1.0 fallback","CBC-mode AES (padding oracle)"]
        },
        {
          "key": "key-mgmt",
          "label": "Key Management System",
          "type": "server",
          "ip": "172.16.1.20",
          "os": "RHEL 9",
          "status": "online",
          "services": ["HTTPS:8443","HSM Interface"],
          "vulnerabilities": ["JWT RS256→HS256 confusion"]
        },
        {
          "key": "air-gap-router",
          "label": "Air-Gap Router",
          "type": "router",
          "ip": "172.16.0.254",
          "os": "pfSense 2.7",
          "status": "online",
          "services": ["Firewall","IDS (Snort)"],
          "vulnerabilities": []
        },
        {
          "key": "analyst-vm",
          "label": "Analyst VM",
          "type": "workstation",
          "ip": "172.16.0.50",
          "os": "Kali Linux 2024",
          "status": "online",
          "services": ["SSH:22"],
          "vulnerabilities": []
        }
      ],
      "connections": [
        {"from": "analyst-vm",  "to": "jump-host",    "protocol": "SSH"},
        {"from": "jump-host",   "to": "air-gap-router","protocol": "Firewall"},
        {"from": "air-gap-router","to": "crypto-lab",  "protocol": "HTTPS"},
        {"from": "air-gap-router","to": "key-mgmt",    "protocol": "HTTPS"},
        {"from": "crypto-lab",  "to": "key-mgmt",     "protocol": "Custom RPC"}
      ]
    }'::jsonb
  )

ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  topology    = EXCLUDED.topology;
