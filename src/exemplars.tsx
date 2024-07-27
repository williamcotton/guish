import { ChatCompletionMessageParam } from "openai/resources";

export const exemplars: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful assistant that generates and updates bash commands based on user prompts. Your responses should be in JSON format with 'bash_command' and 'text_response' fields. You will be building up a pipeline of bash commands and often using different languages. Use a code style in each language that is meant for better readability and consistency with normal style. Err on the side of adding more new lines and spaces for readability. Only use pipes and new commands. Do not use semicolons or double ampersands. Do not read, append or save to files with < or >. Do not use subshells calls $(). This tool is for creating shell pipelines alone. Make sure things like '-' are used to ensure std in, like with `paste -sd+ -`",
  },
  {
    role: "system",
    content: `Non-standard command using custom functions that should be used: pg -d test_database -c 'SELECT * FROM test_table' | tsvtocsv | ggplot 'ggplot(df, aes(as.Date(date), value)) + geom_col()' | pngcopyhtml`,
  },
  {
    role: "system",
    content: `Non-standard command using custom functions that should be used: pg -d test_database -c 'SELECT * FROM test_table' | tsvtohtml | prependcss -c 'tr { border: 1px solid red }'`,
  },
  {
    role: "system",
    content: "Current bash command: ",
  },
  {
    role: "user",
    content: "Generate a command to list files in the current directory.",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      bash_command: "ls -l",
      text_response:
        "Here's a command to list files in the current directory with details:",
    }),
  },
  {
    role: "system",
    content: "Current bash command: ls -l",
  },
  {
    role: "system",
    content:
      "Module 1 output: total 32\ndrwxr-xr-x 2 user group 4096 Jul 22 10:00 Documents\ndrwxr-xr-x 2 user group 4096 Jul 22 10:00 Downloads\n-rw-r--r-- 1 user group 1234 Jul 22 09:50 file1.txt\n-rw-r--r-- 1 user group 5678 Jul 22 09:55 file2.txt...",
  },
  {
    role: "user",
    content: "Now, I want to filter these results to show only .txt files.",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      bash_command: "ls -l | grep '[.txt'",
      text_response:
        "This command lists files and then attempts to filter for .txt files, but there's an error in the grep pattern:",
    }),
  },
  {
    role: "system",
    content: "Current bash command: ls -l | grep '[.txt'",
  },
  {
    role: "system",
    content:
      "Module 1 output: total 32\ndrwxr-xr-x 2 user group 4096 Jul 22 10:00 Documents\ndrwxr-xr-x 2 user group 4096 Jul 22 10:00 Downloads\n-rw-r--r-- 1 user group 1234 Jul 22 09:50 file1.txt\n-rw-r--r-- 1 user group 5678 Jul 22 09:55 file2.txt...",
  },
  {
    role: "system",
    content: "Module 2 output: grep: Unmatched [ or [^",
  },
  {
    role: "user",
    content:
      "I see there's an error. Can you fix the grep command to correctly filter for .txt files?",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      bash_command: "ls -l | grep '\\.txt'",
      text_response:
        "I apologize for the error. Here's the corrected command to filter for .txt files:",
    }),
  },
  {
    role: "system",
    content: "Current bash command: ls -l | grep '\\.txt'",
  },
  {
    role: "system",
    content:
      "Module 1 output: total 32\ndrwxr-xr-x 2 user group 4096 Jul 22 10:00 Documents\ndrwxr-xr-x 2 user group 4096 Jul 22 10:00 Downloads\n-rw-r--r-- 1 user group 1234 Jul 22 09:50 file1.txt\n-rw-r--r-- 1 user group 5678 Jul 22 09:55 file2.txt...",
  },
  {
    role: "system",
    content:
      "Module 2 output: -rw-r--r-- 1 user group 1234 Jul 22 09:50 file1.txt\n-rw-r--r-- 1 user group 5678 Jul 22 09:55 file2.txt",
  },
  {
    role: "user",
    content:
      "Great, now can you modify this to count the number of .txt files?",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      bash_command: "ls -l | grep '\\.txt' | wc -l",
      text_response:
        "This command lists files, filters for .txt files, and then counts them:",
    }),
  },
  {
    role: "system",
    content: "Current bash command: ls -l | grep '\\.txt' | wc -l",
  },
  {
    role: "system",
    content:
      "Module 1 output: total 32\ndrwxr-xr-x 2 user group 4096 Jul 22 10:00 Documents\ndrwxr-xr-x 2 user group 4096 Jul 22 10:00 Downloads\n-rw-r--r-- 1 user group 1234 Jul 22 09:50 file1.txt\n-rw-r--r-- 1 user group 5678 Jul 22 09:55 file2.txt...",
  },
  {
    role: "system",
    content:
      "Module 2 output: -rw-r--r-- 1 user group 1234 Jul 22 09:50 file1.txt\n-rw-r--r-- 1 user group 5678 Jul 22 09:55 file2.txt",
  },
  {
    role: "system",
    content: "Module 3 output: 2",
  },
];
