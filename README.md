# AfterCredits

## Description
I am a huge binge watcher and I have an absurd amount of movies and tv shows that I want to watch or keep track of when they will be released. So I had resorted to making a note in my iPhone notes app and having a checklist there with different sections for each language and just dumped all the shows that I wanted to watch there and ticked them off as I went. It was a good system... until it got too long since all the checked shows are still there on screen. And I had to scroll hundreds of rows below to get to the show I want and sometimes I couldn't even remember what was the plot I thought was interesting of that particular show that got me excited and who the actors were. I had to keep searching it up on google and such since I got the names of those shows from my instagram doomscrolling. 

And at the end... I got sick of it. So I thought why not just make my own app for it? It would teach me a new skill and it would help me organize my shows. It was a win-win situation. Until I had to sit through long boring tutorials to leanr React Native so as to actually start coding because I was so overwhelmed by the amount of files the npx React native base code pulled up. But I sat through the tutorial, finding similarities between React and React Native, taking down notes so I wouldn't forget and I got to it. 

I got on Claude and started brainstorming the idea and figuring out the scope for the first simplest version of the app. I learned about TMDb, connected that to my project and to Supabase, did some sql querying alongside Claude to get my database to exactly what I needed and started coding. It was really awesome to see the changes being made on my actual phone, by connecting it through Expo Go app. When I didn't want to use my phone, I learned about iOS simulators on Mac and connected that to my project and it was soo cool. Like it was an actual real iPhone 17 screen on my mac and I could instantly see the results without having to unlock my phone. Then I locked in, searching up tutorials, learning stuff from Claude to make my coding experience simpler, little nic-nacs. And I finished the first version. 

After which I did not take a break and directly went into creating a better more visually appealing version of the app, adding show cards, buttons/"pressable" in a bunch of places where it was needed, adding collections and sorting according to language and creating new collections, adding ui to the collection to make it look like a shelf of old movie dvd players with the cover of the movie for each spine. There was a lot of googling and reddit deepdives and react native doc reading to figure out everything. 
When I thought I was finally done with the ui and tmdb stuff, I decided that it would be a good idea to add animation. Yay me... And for some reason, I thought it would be easy. Newsflash, it was not. I searched up some react native animation libraries and found reanimated and got that downloaded. After that, I searched up, and you guessed it, more tutorials and also got some help from Claude to learn and figure out how to get what I wanted. And then it was finally done!

Nope. I still had to put it on my phone for daily use because of course I wanted to use it to make my life better. well, that made my life worse. I learned I would have to do something called "sideloading" using xcode to get past having to pay for an apple developer account. So I got to even more docs reading and Claude debugging and finally had my app on my phone, completely usable and I was overjoyed. This was my very first phone app and I think I did a pretty good job on it and im pretty satisfied. 
You can check how this app works in my github release. There is a demo video on there that goes through basically every little detail I have added. I hope you have just as amazing time as I did on this app and I hope you have far less problems when sideloading the app. Anyways, thats all from me!  Ciao!

## Features
- As a guest user, you will be stuck on the login page
- Signup using email, username and password
- Login using email and password
- Navigate through the app using the tabs shown at the bottom of the app screen
- Watchlist page contains all the shows on your 'Want to Watch' list.
    - You can see the movie cover, movie name and release date for each show as you scroll
    - You can use the search bar to search up a show within this list
    - Click on the checkbox next to each show to mark it as completed and watch the cute animation ;)
    - Click on the show itself to open a dedicated show page for the specific show
- Specific show page displays the cover of the show, the show name, and release date
    - You can add a rating to each show by clicking on the stars
    - You can write personal notes for each show filled with your thoughts and other stuff and save it
    - You can toggle the 'Want to Watch' and 'Watched' button to move it between the two lists
    - Read through the genres that the show is marked as and check which language it was made in
    - You can also scroll through the main actors list with the picture of the actor, their name, and the name of the character they played.
    - Click on the 'Add to Collection' button to open a dropdown with a list of all your personal collections and a button 'New Collection' to create a new collection right there and add this show to that collection.
    - Click on the three dots at the top right corner above the movie poster to open a popup with a 'Remove from Watchlist' button to delete show from all your lists.
- Search page shows a search bar which you can use to search from the TMDB database for every possible show or movie ever made.
    - debouncing allows live search as you type
    - displays all the shows with the words you have searched
    - it displays the show's poster, name, and release date
    - on the right side of each card is a '+' button which when clicked adds the particular show to your Want to Watch watchlist
    - click on the 'X' on the search bar to clear search
 - Collections page displays all the custom collections you have made and an 'All Shows' collection
    - All Shows collection displays all the shows you have saved, regardless of watchlist type
        - use the search bar to search through all the shows you have ever saved
        - use the filters under the search bar to filter by language
        - click on any of the show cards to go the the specific show page
        - Switch between the 'Want to Watch' and 'Watched' filters to filter by watchlist type and watch as the number of shows in each language change
    - Custom Collections page displays the name of your custom collection
        - use the search bar to search for shows in this collection
        - displays all the shows in this collection with a delete icon on the right side of each show to delete from this collection
        - the three dots at the top of the page beside the custom name opens a popup with a 'Delete Collection' button to delete the entire collection from your profile
    - Find the '+' button on the bottom right corner and click to open a popup to create a new collection
- Profile page displays all the details of your profile created during signup
    - displays your profile picture. click on the pencil icon to open a popup to upload a picture from your gallery. Click on Allow to access your gallery
    - displays your username. click on the pencil to open a popup to update your username
    - displays your email used to signup
    - shows a password block with a pencil button which when clicked opens a popup to change password
    - displays a small curated card list of the number of 'Total Shows', 'Watched' shows, and 'Want to Watch shows'
    - displays your most watched language according to all the shows saved.
    - click on the signout button to signout of this profile, which then takes you to the login page
    - click on the delete account button which shows a popup to warn about deleting account. If you choose yes, it deletes your account which is permanent
        - This is a soft delete and deletes your profile from the profiles backend, including deleting all the saved shows and collections and other details
        - This does not actually delete the email from the Supabase users and will have to be manually removed. 

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
- iOS only - no Android build has been tested, and some UI (SF Symbols in tab. bar) is iOS-specific, though Material symbol fallbacks are in place.
- No Google/social sign-in. Only email and password
- Pull to refresh doesn't work due to known bug in Expo's `Nativetabs` plus `FlatList` combination; replace dwith manual refresh buttons
- Account deletion is a "soft delete"—it wipes user's data but not heir login credentials.
- No offline support - every screen requires live connection from Supabase and TMDB
- Free tier Apple sideloading expires every 7 days and needs reinstalling via Xcode

## Future Plans
- Google OAuth Sign-in
- Sort/filter for the Watchlist beyond search (by rating, slphabetically, most recently added)
- Broaded Search wth ability to search using not only show names but also actors and release dates.
- TextFlight or App Store release
- Android testing and polish
- Push notifications for upcoming release dates of saved shows
- sharing collections with friends

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
