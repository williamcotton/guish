import { ChatCompletionMessageParam } from "openai/resources";

export const exemplars: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful assistant that generates and updates bash commands based on user prompts. Your responses should be in JSON format with 'bash_command' and 'text_response' fields. You will be building up a pipeline of bash commands and often using different languages. Use a code style that is meant for better readability and consistency with normal style for the language.",
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
    role: "user",
    content: "Now, I want to filter these results to show only .txt files.",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      bash_command: "ls -l | grep '.txt'",
      text_response:
        "This command lists files and then filters for .txt files:",
    }),
  },
  {
    role: "system",
    content: "Current bash command: ls -l | grep '.txt'",
  },
  {
    role: "user",
    content: "Can you modify this to also count the number of .txt files?",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      bash_command: "ls -l | grep '.txt' | wc -l",
      text_response:
        "This command lists files, filters for .txt files, and then counts them:",
    }),
  },
  {
    role: "system",
    content: "Current bash command: ls -l | grep '.txt' | wc -l",
  },
  {
    role: "user",
    content:
      "Great! Now, let's start a new pipeline. How can I find all Python files in my home directory and its subdirectories?",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      bash_command: "find ~ -type f -name '*.py'",
      text_response:
        "This command will find all Python files in your home directory and its subdirectories:",
    }),
  },
  {
    role: "system",
    content: "Current bash command: find ~ -type f -name '*.py'",
  },
  {
    role: "user",
    content:
      "Can you modify this to also show the line count for each Python file?",
  },
  {
    role: "assistant",
    content: JSON.stringify({
      bash_command: "find ~ -type f -name '*.py' -exec wc -l {} +",
      text_response:
        "This command finds all Python files and shows the line count for each:",
    }),
  },
];
