
-- Create function to increment campaign amount
CREATE OR REPLACE FUNCTION public.increment_campaign_amount(
  campaign_id UUID,
  increment_value NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE campaigns
  SET current_amount = current_amount + increment_value,
      updated_at = now()
  WHERE id = campaign_id;
END;
$$;
