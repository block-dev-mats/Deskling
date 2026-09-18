-- Only exact synthetic document-file references. Never enumerate the Desktop.
-- Never return Finder error text, filenames, paths, or object descriptions.
on run chosenIDs
  set rows to {}
  with timeout of 8 seconds
    repeat with chosenID in chosenIDs
      set testID to chosenID as text
      if testID is not in {"A", "B", "C"} then return "invalid"
      set testName to "Deskling-2B-test-" & testID & ".txt"
      try
        tell application "Finder"
          set iconPoint to position of document file testName of desktop
        end tell
        if (count of iconPoint) is not 2 then error number -1700
        set px to (item 1 of iconPoint) as integer
        set py to (item 2 of iconPoint) as integer
        set end of rows to testID & "|ok|" & px & "|" & py
      on error number errorNumber
        if errorNumber is -1743 then
          return "denied"
        else if errorNumber is -1712 then
          return "timeout"
        else if errorNumber is -1728 then
          set end of rows to testID & "|missing"
        else
          set end of rows to testID & "|unavailable"
        end if
      end try
    end repeat
  end timeout
  set AppleScript's text item delimiters to linefeed
  return rows as text
end run
