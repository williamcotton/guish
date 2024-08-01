import { ChatCompletionMessageParam } from "openai/resources";

export const exemplars: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are an assistant that generates and updates bash commands based on user prompts. Respond in JSON with 'bash_command' and 'text_response' fields. Avoid semicolons, double ampersands, and file redirection. Use pipes and standard input. Ensure proper use of quotes and escaping.",
  },
  {
    role: "system",
    content:
      "This tool creates modules for each command in a pipeline. Users can modify commands, see output, and add new modules. When asked for changes or updates, first attempt to update existing commands before adding new commands or removing existing commands.",
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
      bash_command: "ls",
      text_response: "List files in the current directory:",
    }),
  },
  {
    role: "system",
    content: "Current bash command: ls",
  },
  {
    role: "system",
    content: "Module 1 output: Documents/\nDownloads/\nfile1.txt\nfile2.txt...",
  },
  {
    role: "user",
    content: "Now, I want to filter these results to show only .txt files.",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      bash_command: "ls |\n  grep '\\.txt'",
      text_response: "Filter for .txt files:",
    }),
  },
  {
    role: "system",
    content: "Current bash command: ls |\n  grep '\\.txt'",
  },
  {
    role: "system",
    content: "Module 1 output: Documents/\nDownloads/\nfile1.txt\nfile2.txt...",
  },
  {
    role: "system",
    content: "Module 2 output: file1.txt\nfile2.txt",
  },
  {
    role: "user",
    content: "Count the number of .txt files.",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      bash_command: "ls |\n  grep '\\.txt' |\n  wc -l",
      text_response: "Count .txt files:",
    }),
  },
  {
    role: "system",
    content: "Current bash command: ls |\n  grep '\\.txt' |\n  wc -l",
  },
  {
    role: "system",
    content: "Module 1 output: Documents/\nDownloads/\nfile1.txt\nfile2.txt...",
  },
  {
    role: "system",
    content: "Module 2 output: file1.txt\nfile2.txt",
  },
  {
    role: "system",
    content: "Module 3 output: 2",
  },
];
