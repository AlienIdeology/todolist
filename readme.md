### Todolist

## Features
Each todo item has these fields:
 - Done/Not Done (obviously)
 - Text
   - Maximum 50 characters long, can be empty
 - Reminder date
   - Shows up red if overdue but not done, green if overdue and done
   - TODO: An alert will pop up if a reminder date has just been reached
   - For testing purposes, when setting a date that is today, the alert pops up 30 seconds later
 - Remove button (TODO)
The website has:
 - Light/dark themes, can be toggled with button (TODO: beautify)
   - https://www.w3schools.com/howto/howto_css_switch.asp
 - Error messages shows up in order, and disappears automatically
 - Filter todo items by done/not done, overdue/not overdue
   - When a filter button is unchecked (after being checked), the not-filter is on. To remove the filter, press "Remove All" (TODO: tri-state buttons?)
 - Changes to items (creating, updating, or removing) are submitted to the server as changes happen (TODO: refactor)

 TODO: front end js tracks .done and .overdue classes