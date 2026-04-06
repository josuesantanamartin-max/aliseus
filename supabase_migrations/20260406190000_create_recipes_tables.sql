-- Create User Recipes Table
CREATE TABLE IF NOT EXISTS public.user_recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id text, -- ID from TheMealDB, Spoonacular, etc.
  source_provider text, -- 'themealdb', 'spoonacular', 'manual'
  name text NOT NULL,
  image text,
  prep_time integer NOT NULL DEFAULT 30,
  cook_time integer DEFAULT 0,
  calories integer NOT NULL DEFAULT 0,
  base_servings integer NOT NULL DEFAULT 2,
  course_type text, -- STARTER, MAIN, DESSERT, SIDE, DRINK
  difficulty text, -- Fácil, Media, Difícil
  tags text[] DEFAULT '{}'::text[],
  instructions text[] DEFAULT '{}'::text[],
  rating integer DEFAULT 0,
  
  -- Macros
  protein numeric DEFAULT 0,
  carbs numeric DEFAULT 0,
  fat numeric DEFAULT 0,

  times_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT user_recipes_pkey PRIMARY KEY (id)
);

-- Ingredients Table
CREATE TABLE IF NOT EXISTS public.user_recipe_ingredients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.user_recipes(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  
  CONSTRAINT user_recipe_ingredients_pkey PRIMARY KEY (id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_recipes_user_id ON public.user_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recipe_ingredients_recipe_id ON public.user_recipe_ingredients(recipe_id);

-- RLS
ALTER TABLE public.user_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recipes"
  ON public.user_recipes
  FOR ALL
  USING (auth.uid() = user_id);

-- Since recipe_ingredients refers to user_recipes, users can manage ingredients for their own recipes
CREATE POLICY "Users can manage ingredients for their recipes"
  ON public.user_recipe_ingredients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_recipes
      WHERE public.user_recipes.id = public.user_recipe_ingredients.recipe_id
      AND public.user_recipes.user_id = auth.uid()
    )
  );
