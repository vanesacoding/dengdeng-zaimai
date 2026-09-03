-- Phase 2: Community features, circles (闺蜜房), interactions, moderation
-- 2026-09-03

-- ============================================================
-- 1. EXTEND purchase_requests with new fields
-- ============================================================

ALTER TABLE purchase_requests
  ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'FRIENDS'
    CHECK (visibility IN ('PRIVATE','FRIENDS','PUBLIC')),
  ADD COLUMN IF NOT EXISTS mood VARCHAR(30) DEFAULT 'OTHER'
    CHECK (mood IN ('HAPPY','REWARD_MYSELF','STRESSED','SEEDED_BY_OTHERS','LIMITED_TIME_FOMO','ACTUAL_NEED','BORED','OTHER')),
  ADD COLUMN IF NOT EXISTS public_caption TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS product_url TEXT,
  ADD COLUMN IF NOT EXISTS cooling_hours INTEGER DEFAULT 24,
  ADD COLUMN IF NOT EXISTS result_type VARCHAR(30)
    CHECK (result_type IN ('PURCHASED_LOVED','PURCHASED_REGRETTED','STILL_THINKING','GIVEN_UP','BOUGHT_ALTERNATIVE','POSTPONED')),
  ADD COLUMN IF NOT EXISTS result_note TEXT,
  ADD COLUMN IF NOT EXISTS result_image_url TEXT,
  ADD COLUMN IF NOT EXISTS actual_price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'PENDING'
    CHECK (moderation_status IN ('PENDING','VISIBLE','LIMITED','REJECTED','REMOVED'));

CREATE INDEX IF NOT EXISTS idx_purchase_requests_visibility ON purchase_requests(visibility);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_moderation ON purchase_requests(moderation_status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_mood ON purchase_requests(mood);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_result ON purchase_requests(result_type);

-- ============================================================
-- 2. CIRCLES (闺蜜房)
-- ============================================================

CREATE TABLE IF NOT EXISTS circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL DEFAULT '我们的闺蜜房',
  avatar_emoji VARCHAR(10) DEFAULT '👭',
  theme_color VARCHAR(20) DEFAULT '#4F7559',
  invite_phrase_hash TEXT NOT NULL,
  invite_expires_at TIMESTAMPTZ NOT NULL,
  invite_attempt_count INTEGER DEFAULT 0,
  max_members SMALLINT DEFAULT 2,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE circles IS '闺蜜房，支持 2~6 人';
COMMENT ON COLUMN circles.invite_phrase_hash IS '暗号哈希（不存明文）';
COMMENT ON COLUMN circles.invite_attempt_count IS '暗号尝试次数，用于频率限制';

-- ============================================================
-- 3. CIRCLE_MEMBERS (房间成员)
-- ============================================================

CREATE TABLE IF NOT EXISTS circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin','member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','left','removed')),
  UNIQUE(circle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_circle_members_circle ON circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user ON circle_members(user_id);

-- ============================================================
-- 4. CIRCLE_INVITES (暗号邀请记录)
-- ============================================================

CREATE TABLE IF NOT EXISTS circle_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  phrase_hash TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_circle_invites_phrase ON circle_invites(phrase_hash);
CREATE INDEX IF NOT EXISTS idx_circle_invites_circle ON circle_invites(circle_id);

COMMENT ON TABLE circle_invites IS '暗号邀请记录，用于审计和防重放';

-- ============================================================
-- 5. REQUEST_REACTIONS (态度互动)
-- ============================================================

CREATE TABLE IF NOT EXISTS request_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('WORTH_IT','WAIT','RUN_AWAY','SAME_DESIRE','FOLLOW_UP','SAVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_reactions_request ON request_reactions(request_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON request_reactions(user_id);

-- ============================================================
-- 6. REQUEST_COMMENTS (评论，含回复)
-- ============================================================

CREATE TABLE IF NOT EXISTS request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES request_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 500),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_request ON request_comments(request_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON request_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON request_comments(parent_comment_id);

-- ============================================================
-- 7. SAVED_REQUESTS (收藏)
-- ============================================================

CREATE TABLE IF NOT EXISTS saved_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, request_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_requests(user_id);

-- ============================================================
-- 8. FOLLOW_UP_SUBSCRIPTIONS (蹲后续)
-- ============================================================

CREATE TABLE IF NOT EXISTS follow_up_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, request_id)
);

CREATE INDEX IF NOT EXISTS idx_follow_user ON follow_up_subscriptions(user_id);

-- ============================================================
-- 9. MODERATION_REPORTS (举报)
-- ============================================================

CREATE TABLE IF NOT EXISTS moderation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('REQUEST','COMMENT','USER')),
  target_id UUID NOT NULL,
  reason VARCHAR(50) NOT NULL,
  detail TEXT,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','REVIEWED','RESOLVED','DISMISSED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_target ON moderation_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON moderation_reports(status);

-- ============================================================
-- 10. USER_BLOCKS (用户拉黑)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON user_blocks(blocked_id);

-- ============================================================
-- 11. PURCHASE_RESULT_POSTS (结果日记)
-- ============================================================

CREATE TABLE IF NOT EXISTS purchase_result_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  result_type VARCHAR(30) NOT NULL CHECK (result_type IN ('PURCHASED_LOVED','PURCHASED_REGRETTED','STILL_THINKING','GIVEN_UP','BOUGHT_ALTERNATIVE','POSTPONED')),
  note TEXT,
  image_url TEXT,
  actual_price_cents INTEGER,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_result_posts_user ON purchase_result_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_result_posts_public ON purchase_result_posts(is_public);

-- ============================================================
-- 12. PRODUCT_ENTITIES (商品实体，为同款聚合和带货预留)
-- ============================================================

CREATE TABLE IF NOT EXISTS product_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  image_url TEXT,
  product_url TEXT,
  average_price_cents INTEGER,
  mention_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. NOTIFICATION_PREFERENCES (通知偏好)
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_new_post BOOLEAN DEFAULT TRUE,
  friend_invite_review BOOLEAN DEFAULT TRUE,
  friend_opinion BOOLEAN DEFAULT TRUE,
  public_reaction BOOLEAN DEFAULT TRUE,
  public_comment BOOLEAN DEFAULT TRUE,
  public_reply BOOLEAN DEFAULT TRUE,
  public_same_desire BOOLEAN DEFAULT TRUE,
  public_follow_up BOOLEAN DEFAULT TRUE,
  cooling_reminder BOOLEAN DEFAULT TRUE,
  result_reminder BOOLEAN DEFAULT TRUE,
  friend_result_update BOOLEAN DEFAULT TRUE,
  moderation_result BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. PUBLIC_PROFILES (公开昵称和头像资料)
-- ============================================================

CREATE TABLE IF NOT EXISTS public_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(50) NOT NULL DEFAULT '用户',
  avatar_emoji VARCHAR(10) DEFAULT '✨',
  bio TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_profiles_name ON public_profiles(display_name);

-- ============================================================
-- 15. CONTENT_MODERATION_LOGS (内容审核记录)
-- ============================================================

CREATE TABLE IF NOT EXISTS content_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('REQUEST','COMMENT')),
  target_id UUID NOT NULL,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_logs_target ON content_moderation_logs(target_type, target_id);

-- ============================================================
-- 16. REQUEST_STATUS_LOGS (状态流转审计)
-- ============================================================

CREATE TABLE IF NOT EXISTS request_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
  from_status VARCHAR(30),
  to_status VARCHAR(30) NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_logs_request ON request_status_logs(request_id);

-- ============================================================
-- 17. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_result_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_status_logs ENABLE ROW LEVEL SECURITY;

-- circles: members can read, admin can update
CREATE POLICY "circle_members_read" ON circles
  FOR SELECT USING (EXISTS (SELECT 1 FROM circle_members WHERE circle_id = circles.id AND user_id = auth.uid() AND status = 'active'));
CREATE POLICY "circle_creator_all" ON circles
  FOR ALL USING (created_by = auth.uid());

-- circle_members: members read, admin manage
CREATE POLICY "circle_members_select" ON circle_members
  FOR SELECT USING (EXISTS (SELECT 1 FROM circle_members cm2 WHERE cm2.circle_id = circle_members.circle_id AND cm2.user_id = auth.uid() AND cm2.status = 'active'));
CREATE POLICY "circle_members_insert_self" ON circle_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- circle_invites: creator can read, anyone can check (for phrase matching)
CREATE POLICY "circle_invites_read" ON circle_invites
  FOR SELECT USING (created_by = auth.uid());

-- request_reactions: anyone can read public, self manage
CREATE POLICY "reactions_select" ON request_reactions
  FOR SELECT USING (true);
CREATE POLICY "reactions_insert_self" ON request_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reactions_delete_self" ON request_reactions
  FOR DELETE USING (user_id = auth.uid());

-- request_comments: anyone can read (moderation applied in query), self manage
CREATE POLICY "comments_select" ON request_comments
  FOR SELECT USING (is_deleted = FALSE);
CREATE POLICY "comments_insert_self" ON request_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "comments_update_self" ON request_comments
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "comments_delete_self" ON request_comments
  FOR DELETE USING (user_id = auth.uid());

-- saved_requests: self only
CREATE POLICY "saved_select_self" ON saved_requests
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "saved_insert_self" ON saved_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "saved_delete_self" ON saved_requests
  FOR DELETE USING (user_id = auth.uid());

-- follow_up_subscriptions: self only
CREATE POLICY "follow_select_self" ON follow_up_subscriptions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "follow_insert_self" ON follow_up_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "follow_delete_self" ON follow_up_subscriptions
  FOR DELETE USING (user_id = auth.uid());

-- moderation_reports: reporter can read, admin can all
CREATE POLICY "reports_select_reporter" ON moderation_reports
  FOR SELECT USING (reporter_id = auth.uid());
CREATE POLICY "reports_insert_self" ON moderation_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- user_blocks: self only
CREATE POLICY "blocks_select_self" ON user_blocks
  FOR SELECT USING (blocker_id = auth.uid());
CREATE POLICY "blocks_insert_self" ON user_blocks
  FOR INSERT WITH CHECK (blocker_id = auth.uid());
CREATE POLICY "blocks_delete_self" ON user_blocks
  FOR DELETE USING (blocker_id = auth.uid());

-- purchase_result_posts: public ones readable, self manage
CREATE POLICY "result_posts_select" ON purchase_result_posts
  FOR SELECT USING (is_public = TRUE OR user_id = auth.uid());
CREATE POLICY "result_posts_insert_self" ON purchase_result_posts
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "result_posts_update_self" ON purchase_result_posts
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "result_posts_delete_self" ON purchase_result_posts
  FOR DELETE USING (user_id = auth.uid());

-- notification_preferences: self only
CREATE POLICY "notif_prefs_select_self" ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_prefs_insert_self" ON notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif_prefs_update_self" ON notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- public_profiles: public readable, self manage
CREATE POLICY "public_profiles_select" ON public_profiles
  FOR SELECT USING (is_public = TRUE OR user_id = auth.uid());
CREATE POLICY "public_profiles_insert_self" ON public_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "public_profiles_update_self" ON public_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- content_moderation_logs: admin only (placeholder)
CREATE POLICY "mod_logs_select" ON content_moderation_logs
  FOR SELECT USING (false);

-- request_status_logs: readable by request owner or circle members
CREATE POLICY "status_logs_select" ON request_status_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM purchase_requests pr
      WHERE pr.id = request_status_logs.request_id AND pr.user_id = auth.uid()
    )
  );

-- ============================================================
-- 18. FUNCTIONS: updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER circles_updated_at BEFORE UPDATE ON circles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER circle_members_updated_at BEFORE UPDATE ON circle_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER request_comments_updated_at BEFORE UPDATE ON request_comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER purchase_result_posts_updated_at BEFORE UPDATE ON purchase_result_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER product_entities_updated_at BEFORE UPDATE ON product_entities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER public_profiles_updated_at BEFORE UPDATE ON public_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
