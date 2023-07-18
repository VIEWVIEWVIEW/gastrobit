-- Orders
-- 1. Allow everyone to create new orders
-- Target roles: anon, authenticated
-- WITH CHECK true

-- 2. Allow Service Role All Operations
-- Target roles: service_role
-- USING true
-- WITH CHECK true

-- 3. Enable read access restaurant owner
-- Target roles: authenticated
-- USING (auth.uid() IN ( SELECT restaurants.owner_id
--   FROM restaurants
--  WHERE (restaurants.id = orders.restaurand_id)))

----------------------------
-- custom_domains
-- 1. Enable delete for users based on user_id
-- Target roles: Default
-- USING (auth.uid() = user_id)

-- 2. Enable insert for authenticated users only
-- Target roles: authenticated
-- WITH CHECK true

-- 3. Enable read for users where they are the owner of the domain
-- Target roles: Default
-- USING (auth.uid() = user_id)


----------------------------
-- restaurants
-- 1. Enable delete for users based on owner_id
-- Target roles: default
-- USING (auth.uid() = owner_id)

-- 2. Enable insert for authenticated users only
-- Target roles: authenticated
-- WITH CHECK true

-- 3. Enable read access for anonymous users
-- Target roles: anon
-- USING true

-- 4. Enable select for authenticated users
-- Target roles: authenticated
-- USING (auth.uid() = owner_id)

-- 5. Enable update for users based on email
-- Target roles: default
-- USING (((auth.jwt() ->> 'sub'::text))::uuid = owner_id)