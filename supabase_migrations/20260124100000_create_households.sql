-- Create Households Table
CREATE TABLE IF NOT EXISTS public.households (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  currency text NOT NULL CHECK (currency IN ('EUR', 'USD', 'GBP')),
  shared_accounts text[] DEFAULT '{}'::text[],
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT households_pkey PRIMARY KEY (id)
);

-- Create Household Members Table
CREATE TABLE IF NOT EXISTS public.household_members (
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('ADMIN', 'MEMBER', 'VIEWER')),
  can_view_accounts text[] DEFAULT '{}'::text[],
  can_edit_budgets boolean DEFAULT false,
  can_add_transactions boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  CONSTRAINT household_members_pkey PRIMARY KEY (household_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON public.household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_household_owner_id ON public.households(owner_id);

-- Enable RLS
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- Policies for Households
CREATE POLICY "Users can view households they are members of"
  ON public.households
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.households.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert households"
  ON public.households
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and Admins can update households"
  ON public.households
  FOR UPDATE
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.households.id
      AND user_id = auth.uid()
      AND role = 'ADMIN'
    )
  );

-- Policies for Household Members
CREATE POLICY "Members can view other members in same household"
  ON public.household_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members existing_members
      WHERE existing_members.household_id = public.household_members.household_id
      AND existing_members.user_id = auth.uid()
    )
  );

-- Only Admins/Owners can add/manage members (This is simplified, owner logic usually stricter)
CREATE POLICY "Admins can manage members"
  ON public.household_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members admin_check
      WHERE admin_check.household_id = public.household_members.household_id
      AND admin_check.user_id = auth.uid()
      AND admin_check.role = 'ADMIN'
    )
  );

-- Helper function to create household and add owner atomically
CREATE OR REPLACE FUNCTION public.create_new_household(
  household_name text,
  household_currency text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_household_id uuid;
  default_permissions jsonb;
BEGIN
  default_permissions := '{
    "roles": {
      "ADMIN": {
        "canEditBudgets": true,
        "canAddTransactions": true,
        "canManageMembers": true,
        "canInviteUsers": true,
        "canEditSettings": true
      },
      "MEMBER": {
        "canEditBudgets": false,
        "canAddTransactions": true,
        "canManageMembers": false,
        "canInviteUsers": false,
        "canEditSettings": false
      },
      "VIEWER": {
        "canEditBudgets": false,
        "canAddTransactions": false,
        "canManageMembers": false,
        "canInviteUsers": false,
        "canEditSettings": false
      }
    }
  }'::jsonb;

  -- Insert Household
  INSERT INTO public.households (name, owner_id, currency, permissions)
  VALUES (
    household_name,
    auth.uid(),
    household_currency,
    default_permissions
  )
  RETURNING id INTO new_household_id;

  -- Insert Member (Owner as ADMIN)
  INSERT INTO public.household_members (
    household_id,
    user_id,
    role,
    can_edit_budgets,
    can_add_transactions
  )
  VALUES (
    new_household_id,
    auth.uid(),
    'ADMIN',
    true,
    true
  );

  RETURN new_household_id;
END;
$$;

-- Create Household Invites Table
CREATE TABLE IF NOT EXISTS public.household_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('ADMIN', 'MEMBER', 'VIEWER')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED')),
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT household_invites_pkey PRIMARY KEY (id)
);

-- RLS for Invites
ALTER TABLE public.household_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view/create invites"
  ON public.household_invites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.household_invites.household_id
      AND user_id = auth.uid()
      AND role = 'ADMIN'
    )
  );

-- Household Messages table for internal chat
CREATE TABLE IF NOT EXISTS public.household_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT household_messages_pkey PRIMARY KEY (id)
);

-- RLS for Messages
ALTER TABLE public.household_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view messages" 
  ON public.household_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = public.household_messages.household_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send messages" 
  ON public.household_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = public.household_messages.household_id 
      AND user_id = auth.uid()
    )
  );

-- Create Secure View for Output (joining with auth.users)
CREATE OR REPLACE VIEW public.vw_household_members AS
SELECT 
    hm.household_id,
    hm.user_id,
    hm.role,
    hm.joined_at,
    u.email,
    u.raw_user_meta_data->>'full_name' AS full_name
FROM 
    public.household_members hm
JOIN 
    auth.users u ON hm.user_id = u.id;



