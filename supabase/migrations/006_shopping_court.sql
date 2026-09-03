-- Migration 006: Shopping Court (等等法庭)
-- Adds shopping_cases, case_evidence, case_verdicts, sponsored_cases
-- Extends request_comments with witness_role
-- 2026-09-03
-- NOT executed online — file only

-- ============================================================
-- 1. SHOPPING_CASES (购物案)
-- ============================================================

CREATE TABLE IF NOT EXISTS shopping_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES purchase_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_number VARCHAR(30) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  case_reason TEXT,
  public_statement TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN','NEED_EVIDENCE','JURY_VOTING','COOLING','VERDICT_READY','CLOSED')),
  verdict_type VARCHAR(30)
    CHECK (verdict_type IS NULL OR verdict_type IN ('APPROVED_BY_JURY','COOLING_RECOMMENDED','WALLET_PROTECTED','MORE_EVIDENCE_NEEDED','JURY_DIVIDED')),
  content_source VARCHAR(20) NOT NULL DEFAULT 'USER'
    CHECK (content_source IN ('USER','EDITORIAL','SPONSORED')),
  moderation_status VARCHAR(20) DEFAULT 'PENDING'
    CHECK (moderation_status IN ('PENDING','VISIBLE','LIMITED','REJECTED','REMOVED')),
  is_anonymous BOOLEAN DEFAULT FALSE,
  allow_share_card BOOLEAN DEFAULT TRUE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shopping_cases_case_number ON shopping_cases(case_number);
CREATE INDEX IF NOT EXISTS idx_shopping_cases_request ON shopping_cases(request_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cases_user ON shopping_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cases_status ON shopping_cases(status);
CREATE INDEX IF NOT EXISTS idx_shopping_cases_source ON shopping_cases(content_source);
CREATE INDEX IF NOT EXISTS idx_shopping_cases_moderation ON shopping_cases(moderation_status);

COMMENT ON TABLE shopping_cases IS '购物案 — 公域轻喜剧法庭包装';
COMMENT ON COLUMN shopping_cases.case_number IS '随机编号，不连续，不暴露业务量';
COMMENT ON COLUMN shopping_cases.is_demo IS '标记为演示数据';

-- ============================================================
-- 2. CASE_EVIDENCE (案件证据)
-- ============================================================

CREATE TABLE IF NOT EXISTS case_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES shopping_cases(id) ON DELETE CASCADE,
  evidence_type VARCHAR(30) NOT NULL
    CHECK (evidence_type IN ('HAS_SIMILAR_ITEM','NEW_DESIRE','LIMITED_PROMOTION','PLANNED_PURCHASE','NECESSITY','LONG_CONSIDERATION','BUDGET_COMFORTABLE','BUDGET_CONSIDER','BUDGET_TIGHT','CUSTOM')),
  public_text VARCHAR(200) NOT NULL,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_evidence_case ON case_evidence(case_id);

COMMENT ON TABLE case_evidence IS '案件关键证据，只存储可公开信息';

-- ============================================================
-- 3. CASE_VERDICTS (案件判决快照)
-- ============================================================

CREATE TABLE IF NOT EXISTS case_verdicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES shopping_cases(id) ON DELETE CASCADE,
  verdict_type VARCHAR(30) NOT NULL
    CHECK (verdict_type IN ('APPROVED_BY_JURY','COOLING_RECOMMENDED','WALLET_PROTECTED','MORE_EVIDENCE_NEEDED','JURY_DIVIDED')),
  vote_snapshot JSONB,
  best_testimony_id UUID,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  is_final BOOLEAN DEFAULT FALSE,
  UNIQUE(case_id, is_final) -- only one final verdict per case
);

CREATE INDEX IF NOT EXISTS idx_case_verdicts_case ON case_verdicts(case_id);

COMMENT ON TABLE case_verdicts IS '案件判决快照 — 社区意见摘要，不替用户决定';

-- ============================================================
-- 4. EXTEND request_comments with witness_role
-- ============================================================

ALTER TABLE request_comments
  ADD COLUMN IF NOT EXISTS witness_role VARCHAR(30) DEFAULT 'NONE'
    CHECK (witness_role IN ('SAME_ITEM_OWNER','DEFENSE','COOLING_ADVISER','PURCHASED_USER','ALTERNATIVE_SCOUT','EVIDENCE_PROVIDER','NONE'));

COMMENT ON COLUMN request_comments.witness_role IS '证词角色标签，轻量表达，不代表真实职业';

-- ============================================================
-- 5. SPONSORED_CASES (品牌送审)
-- ============================================================

CREATE TABLE IF NOT EXISTS sponsored_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES shopping_cases(id) ON DELETE CASCADE,
  sponsor_name VARCHAR(100) NOT NULL,
  disclosure TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','ACTIVE','ENDED','REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id)
);

CREATE INDEX IF NOT EXISTS idx_sponsored_cases_status ON sponsored_cases(status);

COMMENT ON TABLE sponsored_cases IS '品牌送审内容 — 必须明确标记，不能伪装为用户内容';

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE shopping_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsored_cases ENABLE ROW LEVEL SECURITY;

-- shopping_cases: public cases readable by all, self manage
CREATE POLICY "shopping_cases_select" ON shopping_cases
  FOR SELECT USING (
    moderation_status = 'VISIBLE'
    OR user_id = auth.uid()
  );
CREATE POLICY "shopping_cases_insert_self" ON shopping_cases
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "shopping_cases_update_self" ON shopping_cases
  FOR UPDATE USING (user_id = auth.uid());

-- case_evidence: readable if case is visible, self manage
CREATE POLICY "case_evidence_select" ON case_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shopping_cases
      WHERE shopping_cases.id = case_evidence.case_id
      AND (shopping_cases.moderation_status = 'VISIBLE' OR shopping_cases.user_id = auth.uid())
    )
  );
CREATE POLICY "case_evidence_insert_self" ON case_evidence
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_cases
      WHERE shopping_cases.id = case_evidence.case_id
      AND shopping_cases.user_id = auth.uid()
    )
  );

-- case_verdicts: readable if case is visible
CREATE POLICY "case_verdicts_select" ON case_verdicts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shopping_cases
      WHERE shopping_cases.id = case_verdicts.case_id
      AND (shopping_cases.moderation_status = 'VISIBLE' OR shopping_cases.user_id = auth.uid())
    )
  );

-- sponsored_cases: readable if case is visible
CREATE POLICY "sponsored_cases_select" ON sponsored_cases
  FOR SELECT USING (
    status IN ('ACTIVE','ENDED')
    OR EXISTS (
      SELECT 1 FROM shopping_cases
      WHERE shopping_cases.id = sponsored_cases.case_id
      AND shopping_cases.user_id = auth.uid()
    )
  );

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

CREATE TRIGGER shopping_cases_updated_at BEFORE UPDATE ON shopping_cases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
