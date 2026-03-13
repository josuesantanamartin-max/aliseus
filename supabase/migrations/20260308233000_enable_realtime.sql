DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'finance_transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE finance_transactions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'finance_budgets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE finance_budgets;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'life_weekly_plan'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE life_weekly_plan;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'life_shopping_list'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE life_shopping_list;
  END IF;
END $$;
