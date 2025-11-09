-- Add clinician and radiologist roles to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'clinician';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'radiologist';

-- Create admin analytics view for performance
CREATE OR REPLACE VIEW admin_analytics AS
SELECT 
  COUNT(*) as total_assessments,
  COUNT(*) FILTER (WHERE has_image = true) as assessments_with_imaging,
  COUNT(*) FILTER (WHERE confidence = 'high') as high_confidence,
  COUNT(*) FILTER (WHERE confidence = 'medium') as medium_confidence,
  COUNT(*) FILTER (WHERE confidence = 'low') as low_confidence,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30_days
FROM patient_assessments;

-- Grant access to the view for authenticated users
GRANT SELECT ON admin_analytics TO authenticated;

-- Create a function to get assessment statistics by date
CREATE OR REPLACE FUNCTION get_assessment_stats(days_back integer DEFAULT 30)
RETURNS TABLE (
  date date,
  total_count bigint,
  high_confidence_count bigint,
  medium_confidence_count bigint,
  low_confidence_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE confidence = 'high') as high_confidence_count,
    COUNT(*) FILTER (WHERE confidence = 'medium') as medium_confidence_count,
    COUNT(*) FILTER (WHERE confidence = 'low') as low_confidence_count
  FROM patient_assessments
  WHERE created_at > NOW() - make_interval(days => days_back)
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
$$;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Create RLS policy for admin analytics view
CREATE POLICY "Only admins can view analytics"
ON patient_assessments
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  auth.uid() = user_id
);