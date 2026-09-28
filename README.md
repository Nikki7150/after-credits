# AfterCredits

## Description


## Features
- 

## Technologies used
- React Native
- Expo
- Expo Router
- TypeScript
- React Native Reanimated
- Xcode - side-loading app to phone
- Supabase - Auth, Postgres with RLS, Storage
- TMBD API
- Google Fonts - expo-font

## Limitations
- 

## Future Plans
- 

## How to set up locally
### Prerequisites
- Node.js 18+
- A Mac with Xcode installed (for iOS builds)
- CocoaPods
- A Supabase project (free tier)
- TMBD API account and API Read Access Token (free)

### Setup
1. Clone and Install
```bash
git clone https://github.com/Nikki7150/after-credits.git
cd after-credits
npm install
```

2. Environment Variables
Create a `.env` file in the project root:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_TMDB_TOKEN=your_tmdb_read_access_token
```
Find the Supabase values in your project's **Settings → API.** Find the TMDB token in your TMDB account's **Settings → API.** (use the "API Read Access Token", not the shorter v3 key).

3. Database Setup
In your Supabase project's SQL Editor, run the following to create the tables and their own row-level security policies:
```sql
-- SHOWS
create table shows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tmdb_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  release_date text,
  language text,
  genres text[],
  cast_members jsonb,
  status text not null default 'want_to_watch' check (status in ('want_to_watch', 'watched')),
  rating integer check (rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, tmdb_id, media_type)
);
alter table shows enable row level security;
create policy "Users manage their own shows" on shows
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 
-- COLLECTIONS
create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
alter table collections enable row level security;
create policy "Users manage their own collections" on collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 
-- COLLECTION_SHOWS (join table)
create table collection_shows (
  collection_id uuid not null references collections(id) on delete cascade,
  show_id uuid not null references shows(id) on delete cascade,
  primary key (collection_id, show_id)
);
alter table collection_shows enable row level security;
create policy "Users manage rows for their own collections" on collection_shows
  for all using (
    exists (select 1 from collections
            where collections.id = collection_shows.collection_id
            and collections.user_id = auth.uid())
  );
 
-- PROFILES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "Users manage their own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
```
 
Then set up the avatar storage: in **Storage**, create a bucket named `avatars`
and mark it **Public**. In its **Policies** tab, add:
 
```sql
create policy "Users can upload their own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and name = auth.uid()::text || '.jpg');
 
create policy "Users can update their own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and name = auth.uid()::text || '.jpg');
 
create policy "Users can view their own avatar" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and name = auth.uid()::text || '.jpg');
```
In **Authentication → Providers → Email**, you can turn off "Confirm email"
for easier local testing.

4. Run the App
For everyday development (hot-reloads on save and is faster):
```bash
npx expo start
```

Press `i` to open in the iOS Simulator on your Mac, or scan the QR code with your physical device (requires a development build - see below - since this projecrt uses native modules not supported in the plain Expo Go app).

#### First-time native build
The app uses native modules (Reanimated, image picker, custom fonts) that require a development build rather than the standard Expo GO app:
```bash
npx expo prebuild --clean
npx expo run:ios
```
This generates the `ios/` folder and builds/installs the app via Xcode. You'll need to select a development team under **Signing & Capabilities** in Xcode the first time you build for a physical device. 

## Notes
- `NativeTabs` (`expo-router/unstable-native-tabs`) is an experimental APO and only renders on iOS/Android - there's no web fallback for the tab bar.
- To run a standalone build that doesn't need Metro/your computer running, build with `npx expo run:ios --configuration Release`.
- With a free Apple Id (no paid Apple developer account), an installed build expires after 7 days and needs to be reinstalled onto your physical device via Xcode. 
