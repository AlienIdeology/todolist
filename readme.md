### Todolist

## Features
 - Three themes (blue, black, yellow), can be toggled with button
  - Themes can be easily added by modifying [themes.css](/resources/css/themes.css) and adding the theme name to [themes.json](/themes.json).
    ```css
    :root[theme="theme_name"] {
        ...
    }
    ```
 - Each todo item has these fields:
   - Done/Not Done (obviously)
   - Text
     - Maximum 50 characters long, can be empty
   - Reminder date
     - Red if the date is before the day that the website is loaded (overdue), but not done
     - Green if overdue and done
   - Remove button
     - Spins around on hover
     - There is a bug with Google Chrome where the css transition property might fire on page load/reload. Adding an empty script tag at the end of the html body seems to have fixed it most of the time.
 - Error messages shows up on the top of the page, then disappears automatically after 5 seconds
 - Filter todo items by done/not done, overdue/not overdue
 - Changes to items (creating, updating, or removing) are submitted to the server as changes happen

Future directions:
 - User system
 - Categories
 - Tags