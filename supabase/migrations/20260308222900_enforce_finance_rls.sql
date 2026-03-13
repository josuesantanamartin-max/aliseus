-- 1. DROP Existing permissive policies on finance tables

-- finance_accounts
DROP POLICY IF EXISTS "finance_accounts_select" ON finance_accounts;
DROP POLICY IF EXISTS "finance_accounts_insert" ON finance_accounts;
DROP POLICY IF EXISTS "finance_accounts_update" ON finance_accounts;
DROP POLICY IF EXISTS "finance_accounts_delete" ON finance_accounts;

-- finance_transactions
DROP POLICY IF EXISTS "finance_transactions_select" ON finance_transactions;
DROP POLICY IF EXISTS "finance_transactions_insert" ON finance_transactions;
DROP POLICY IF EXISTS "finance_transactions_update" ON finance_transactions;
DROP POLICY IF EXISTS "finance_transactions_delete" ON finance_transactions;

-- finance_budgets
DROP POLICY IF EXISTS "finance_budgets_select" ON finance_budgets;
DROP POLICY IF EXISTS "finance_budgets_insert" ON finance_budgets;
DROP POLICY IF EXISTS "finance_budgets_update" ON finance_budgets;
DROP POLICY IF EXISTS "finance_budgets_delete" ON finance_budgets;

-- finance_debts
DROP POLICY IF EXISTS "finance_debts_select" ON finance_debts;
DROP POLICY IF EXISTS "finance_debts_insert" ON finance_debts;
DROP POLICY IF EXISTS "finance_debts_update" ON finance_debts;
DROP POLICY IF EXISTS "finance_debts_delete" ON finance_debts;

-- finance_goals
DROP POLICY IF EXISTS "finance_goals_select" ON finance_goals;
DROP POLICY IF EXISTS "finance_goals_insert" ON finance_goals;
DROP POLICY IF EXISTS "finance_goals_update" ON finance_goals;
DROP POLICY IF EXISTS "finance_goals_delete" ON finance_goals;


-- 2. CREATE New restrictive policies enforcing user_id = auth.uid()

-- Helpers: We use the existing household_members check for SELECT/INSERT where household scope is relevant.
-- The condition: (household_id IN (SELECT household_members.household_id FROM household_members WHERE (household_members.user_id = auth.uid())))

-- ==========================================================================================
-- finance_accounts
-- ==========================================================================================
CREATE POLICY "finance_accounts_select" ON finance_accounts FOR SELECT USING (
  user_id = auth.uid() OR household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_accounts_insert" ON finance_accounts FOR INSERT WITH CHECK (
  user_id = auth.uid() AND household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_accounts_update" ON finance_accounts FOR UPDATE USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid() AND household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_accounts_delete" ON finance_accounts FOR DELETE USING (
  user_id = auth.uid()
);

-- ==========================================================================================
-- finance_transactions
-- ==========================================================================================
CREATE POLICY "finance_transactions_select" ON finance_transactions FOR SELECT USING (
  user_id = auth.uid() OR household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_transactions_insert" ON finance_transactions FOR INSERT WITH CHECK (
  user_id = auth.uid() AND household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_transactions_update" ON finance_transactions FOR UPDATE USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid() AND household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_transactions_delete" ON finance_transactions FOR DELETE USING (
  user_id = auth.uid()
);

-- ==========================================================================================
-- finance_budgets
-- ==========================================================================================
CREATE POLICY "finance_budgets_select" ON finance_budgets FOR SELECT USING (
  user_id = auth.uid() OR household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_budgets_insert" ON finance_budgets FOR INSERT WITH CHECK (
  user_id = auth.uid() AND household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_budgets_update" ON finance_budgets FOR UPDATE USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid() AND household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_budgets_delete" ON finance_budgets FOR DELETE USING (
  user_id = auth.uid()
);

-- ==========================================================================================
-- finance_debts
-- ==========================================================================================
CREATE POLICY "finance_debts_select" ON finance_debts FOR SELECT USING (
  user_id = auth.uid() OR household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_debts_insert" ON finance_debts FOR INSERT WITH CHECK (
  user_id = auth.uid() AND household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_debts_update" ON finance_debts FOR UPDATE USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid() AND household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_debts_delete" ON finance_debts FOR DELETE USING (
  user_id = auth.uid()
);

-- ==========================================================================================
-- finance_goals
-- ==========================================================================================
CREATE POLICY "finance_goals_select" ON finance_goals FOR SELECT USING (
  user_id = auth.uid() OR household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_goals_insert" ON finance_goals FOR INSERT WITH CHECK (
  user_id = auth.uid() AND household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_goals_update" ON finance_goals FOR UPDATE USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid() AND household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
);

CREATE POLICY "finance_goals_delete" ON finance_goals FOR DELETE USING (
  user_id = auth.uid()
);
