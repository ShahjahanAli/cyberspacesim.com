-- 006_views.sql
-- Leaderboard views: individual + team + war standings

-- ── Individual Leaderboard ────────────────────────────────────────────────────
DROP VIEW IF EXISTS leaderboard CASCADE;
CREATE VIEW leaderboard AS
SELECT
  u.id,
  u.clerk_id,
  COALESCE(u.username, split_part(u.email, '@', 1), 'Agent-' || substr(u.id::text, 1, 6)) AS display_name,
  u.avatar_url,
  u.total_xp,
  u.streak_days,
  u.last_active,
  COUNT(DISTINCT sc.id)::INT                          AS scenarios_completed,
  COUNT(DISTINCT ucp.id) FILTER (
    WHERE ucp.status = 'completed'
  )::INT                                              AS challenges_completed,
  COALESCE(SUM(sc.score)      , 0)::INT               AS total_score,
  COALESCE(ROUND(AVG(sc.score)), 0)::INT               AS avg_score,
  -- team membership (first team found)
  (SELECT t.name
   FROM team_members tm
   JOIN teams t ON t.id = tm.team_id
   WHERE tm.user_id = u.id
   ORDER BY tm.joined_at
   LIMIT 1)                                          AS team_name,
  (SELECT t.slug
   FROM team_members tm
   JOIN teams t ON t.id = tm.team_id
   WHERE tm.user_id = u.id
   ORDER BY tm.joined_at
   LIMIT 1)                                          AS team_slug
FROM users u
LEFT JOIN scenario_completions sc        ON sc.user_id = u.id
LEFT JOIN user_challenge_progress ucp    ON ucp.user_id = u.id
GROUP BY u.id, u.clerk_id, u.username, u.email, u.avatar_url, u.total_xp, u.streak_days, u.last_active
ORDER BY u.total_xp DESC, avg_score DESC;

-- ── Team Leaderboard ──────────────────────────────────────────────────────────
DROP VIEW IF EXISTS team_leaderboard CASCADE;
CREATE VIEW team_leaderboard AS
SELECT
  t.id,
  t.slug,
  t.name,
  t.logo_url,
  t.total_xp,
  COUNT(DISTINCT tm.user_id)::INT                    AS member_count,
  COALESCE(SUM(u.total_xp), 0)::INT                 AS combined_xp,
  COUNT(DISTINCT sc.id)::INT                         AS scenarios_completed,
  COUNT(DISTINCT we.id) FILTER (
    WHERE we.event_type = 'flag_captured'
  )::INT                                             AS flags_captured,
  -- war stats
  COUNT(DISTINCT wp.war_id)::INT                     AS wars_participated,
  COUNT(DISTINCT wr.winner_participant_id) FILTER (
    WHERE wr.winner_participant_id IN (
      SELECT id FROM war_participants WHERE team_id = t.id
    )
  )::INT                                             AS rounds_won
FROM teams t
LEFT JOIN team_members tm         ON tm.team_id = t.id
LEFT JOIN users u                 ON u.id = tm.user_id
LEFT JOIN scenario_completions sc ON sc.user_id = u.id
LEFT JOIN war_participants wp      ON wp.team_id = t.id
LEFT JOIN war_rounds wr           ON wr.war_id = wp.war_id
LEFT JOIN war_events we           ON we.participant_id = wp.id
GROUP BY t.id, t.slug, t.name, t.logo_url, t.total_xp
ORDER BY t.total_xp DESC, combined_xp DESC;

-- ── War Standings ─────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS war_standings CASCADE;
CREATE VIEW war_standings AS
SELECT
  w.id            AS war_id,
  w.slug          AS war_slug,
  w.title         AS war_title,
  w.type,
  w.mode,
  w.status,
  wp.id           AS participant_id,
  wp.side,
  wp.status       AS participant_status,
  wp.score,
  t.name          AS team_name,
  t.slug          AS team_slug,
  u.id            AS user_id,
  COALESCE(u.username, split_part(u.email,'@',1)) AS user_display_name,
  COUNT(we.id)::INT                              AS total_events,
  COUNT(we.id) FILTER (
    WHERE we.event_type = 'flag_captured'
  )::INT                                         AS flags_captured,
  COALESCE(SUM(we.points_awarded), 0)::INT       AS event_points
FROM wars w
JOIN war_participants wp   ON wp.war_id = w.id
LEFT JOIN teams t          ON t.id = wp.team_id
LEFT JOIN users u          ON u.id = wp.user_id
LEFT JOIN war_events we    ON we.participant_id = wp.id
GROUP BY w.id, w.slug, w.title, w.type, w.mode, w.status,
         wp.id, wp.side, wp.status, wp.score,
         t.name, t.slug, u.id, u.username, u.email
ORDER BY w.created_at DESC, wp.score DESC;
