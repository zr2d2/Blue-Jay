Copyright (C) 2011 Bluejay

This file is part of Bluejay.

Bluejay is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Bluejay is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Bluejay.  If not, see <http://www.gnu.org/licenses/>.

PURPOSE:
The Bluejay project is to create a recommendation engine to better predict which song a user would like to listen to in his or her media player with minimal user input.
It will make use of more time-sensitive data than other recommendation engines typically use.
This will allow the engine to make educated guesses based on which songs go together, which mood the user may currently be in, and similar factors.

TECHNOLOGY:
We have created a plugin for the open-source media player Songbird

INSTALLATION INSTRUCTIONS:
You must have the music player Songbird, which is a free and open source download available at http://getsongbird.com/
To install Bluejay:
1. Open Songbird.
2. Go to Tools->Addons and click "Install"
3. Navigate to the file "Bluejay.xpi" on your computer
4. When Songbird prompts you to restart Songbird, restart Songbird

STARTUP INSTRUCTIONS:
1. After starting Songbird, click the pane button at the top-right corner of the screen to view the Bluejay user interface.
2. Push Songbird's play button to start the player.
3. Click "ok" on each of the windows. Once the song changes, the engine has started successfully

RATING INSTRUCTIONS:
To rate a song, use the bar on the right-hand side of the screen, to the right of the words "Rate Song." This gives the rating to Bluejay.
Each rating you assign to a song has a timestamp associated with it. Just because you like a song now doesn't mean you will like it later, and vice versa.
Each time you select a number of stars from the dropdown menu, it assigns that rating to the current song. The more often you rate a song, the better the song choices will be.
However, Bluejay can still make good choices without many ratings.

ALGORITHM NOTES:
In addition to the ratings you give to Bluejay, there are other factors that Bluejay uses to better choose the best song to play.
Bluejay uses the ratings known to Songbird of the songs in your library. This means it can make reasonable recommendations as soon as you start it up.
Bluejay remembers whenever you skip a song. Skipping a song acts like a downvote and makes it less likely to play again soon.
When considering a song in your library, Bluejay factors in ratings assigned to other songs of the same genre or artist, which is especially helpful for songs with few or no ratings.

REALITY CHECK:
Bluejay initially assumes that you don't want to hear the same songs over and over again, and it should never forget about a song completely.
However, you can train it to play primarily the same few songs over and over again if that's what you want. If you repeatedly give 5-star ratings to only a small number of songs, that's what will happen.
Just keep in mind that when you rate a song, you should rate how happy you are that the song is playing right now, not how much you have liked the song in the past.
It's also okay to skip a good song if you simply don't want to hear it now. If you've given it good ratings in the past, it will appear again soon.

Enjoy!
