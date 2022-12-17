### Todolist

## Features
Each todo item has these fields:
 - Done/Not Done (obviously)
 - Text
   - Maximum 50 characters long, can be empty
 - Reminder date
   - Red if the date is before the day that the website is loaded (overdue), but not done
   - Green if overdue and done
 - Remove button
   - Spins around on hover
   - There is a bug with Google Chrome where the css transition property might fire on page load/reload. Adding an empty script tag at the end of the html body seems to have fixed it most of the time.

The website has:
 - Light/dark themes, can be toggled with button (TODO: beautify)
   - https://www.w3schools.com/howto/howto_css_switch.asp
 - Error messages shows up in order, and disappears automatically
 - Filter todo items by done/not done, overdue/not overdue
   - When a filter button is unchecked (after being checked), the not-filter is on. To remove the filter, press "Remove All" (TODO: tri-state buttons?)
 - Changes to items (creating, updating, or removing) are submitted to the server as changes happen