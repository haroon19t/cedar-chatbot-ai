// app/page.tsx
import Chatbot from "@/components/chatbot/chatbot";
import { constructMetadata } from "@/lib/utils";

const meta_data = {
  title: "Welcome to Cedar Bot – Your Cedar Financial Policy Guide",
  description:
    "Need quick answers to HR, compliance, or IT questions? Cedar Bot helps Cedar Financial employees navigate company policies with clarity, accuracy, and empathy.",
};
export const metadata = constructMetadata(meta_data);

export default function Home() {
  return (
    
    <>
 
    <Chatbot/>
  
    </>
  );
}
