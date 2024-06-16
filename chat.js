import { BedrockChat } from "@langchain/community/chat_models/bedrock";
import { RedisChatMessageHistory } from "@langchain/redis";
//import { ValkeyChatMessageHistory } from "./valkey_chat_history.js";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import prompt from "prompt";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const chatPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "The following is a friendly conversation between a human and an AI.",
  ],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
]);

const memory = new BufferMemory({
  chatHistory: new RedisChatMessageHistory({
  //chatHistory: new ValkeyChatMessageHistory({
    sessionId: new Date().toISOString(),
    sessionTTL: 300,
    host: "localhost",
    port: 6379,
  }),
  returnMessages: true,
  memoryKey: "chat_history",
});

const model = "anthropic.claude-3-sonnet-20240229-v1:0"
const region = "us-east-1"

const langchainBedrockChatModel = new BedrockChat({
  model: model,
  region: region,
  modelKwargs: {
    anthropic_version: "bedrock-2023-05-31",
  },
});

const chain = new ConversationChain({
   llm: langchainBedrockChatModel,
   memory: memory,
   //verbose: true,
   prompt: chatPrompt,
});


while (true) {
  prompt.start({noHandleSIGINT: true});
  const {message} = await prompt.get(['message']);
  const response = await chain.invoke({
    input: message,
  });
  console.log(response);
}