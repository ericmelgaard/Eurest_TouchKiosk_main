/*
# Add storage upload/delete policies for kiosk-assets bucket

1. Security Changes
   - Add INSERT policy on storage.objects: allows anon + authenticated to upload to the kiosk-assets bucket.
   - Add UPDATE policy on storage.objects: allows upsert overwrites in kiosk-assets.
   - Add DELETE policy on storage.objects: allows removing assets from kiosk-assets.
   - The existing SELECT policy (kiosk_assets_public_read) already allows public reads.

2. Notes
   - This is a single-tenant config tool with no user auth, so anon access is required.
   - The bucket is already public for reads; these policies enable writes.
*/

DROP POLICY IF EXISTS "kiosk_assets_insert" ON storage.objects;
CREATE POLICY "kiosk_assets_insert" ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'kiosk-assets');

DROP POLICY IF EXISTS "kiosk_assets_update" ON storage.objects;
CREATE POLICY "kiosk_assets_update" ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'kiosk-assets')
  WITH CHECK (bucket_id = 'kiosk-assets');

DROP POLICY IF EXISTS "kiosk_assets_delete" ON storage.objects;
CREATE POLICY "kiosk_assets_delete" ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'kiosk-assets');
