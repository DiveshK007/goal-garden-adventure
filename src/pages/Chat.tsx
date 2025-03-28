
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, RotateCcw, PlusCircle, Lightbulb } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTask } from "@/contexts/TaskContext";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const suggestedPrompts = [
  "I'm feeling overwhelmed with my workload. Can you help me plan?",
  "How can I improve my study habits?",
  "I'm procrastinating too much. Any advice?",
  "What's a good way to balance school and extracurriculars?",
  "I'm stressed about my upcoming exam. Any tips?",
];

// Predefined responses for the AI buddy
const getBotResponse = (message: string): string => {
  message = message.toLowerCase();
  
  if (message.includes("overwhelm") || message.includes("workload") || message.includes("too much")) {
    return "I understand feeling overwhelmed can be tough. Let's break down your workload into smaller, manageable tasks. Try listing everything you need to do, then prioritize them based on deadlines and importance. Focus on one task at a time, and remember to schedule short breaks to avoid burnout. Would you like me to help you create a study schedule?";
  }
  
  if (message.includes("study habit") || message.includes("focus") || message.includes("concentrate")) {
    return "Improving study habits takes practice! Try the Pomodoro technique: study for 25 minutes, then take a 5-minute break. Find a quiet environment with minimal distractions. Consider using active learning methods like teaching concepts to yourself or making flashcards. Also, proper sleep, nutrition, and exercise significantly impact your ability to focus and retain information. What specific aspect of studying would you like to improve?";
  }
  
  if (message.includes("procrastinat")) {
    return "Procrastination happens to everyone! Try breaking tasks into smaller, less intimidating chunks. Set specific goals with deadlines, and reward yourself when you complete them. Remove distractions like your phone when studying. Sometimes starting is the hardest part—try committing to just 5 minutes of work, and you'll often find yourself continuing once you've begun. Would you like more specific strategies?";
  }
  
  if (message.includes("balance") || message.includes("extracurricular")) {
    return "Balancing academics and extracurriculars requires good time management. Use a planner or calendar to schedule everything, including study time and activities. Be realistic about how much you can handle, and don't be afraid to say no to additional commitments if you're already stretched thin. Quality often matters more than quantity, so focus on excelling in fewer activities rather than spreading yourself too thin. How many extracurricular activities are you currently involved in?";
  }
  
  if (message.includes("stress") || message.includes("anxious") || message.includes("exam") || message.includes("test")) {
    return "Exam stress is completely normal. Ensure you're preparing effectively—create a study schedule, use active recall techniques, and take care of your wellbeing. Get enough sleep before the exam rather than pulling all-nighters. Practice deep breathing or mindfulness exercises when feeling anxious. Remember, one exam doesn't define your worth or intelligence. Focus on doing your best rather than achieving perfection. Would you like some relaxation techniques to try before your exam?";
  }
  
  if (message.includes("hi") || message.includes("hello") || message.includes("hey")) {
    return "Hello! I'm your AI study buddy. How can I help you today with your academic journey? Feel free to ask me about study techniques, time management, or anything else related to your education!";
  }
  
  // Default response if no patterns match
  return "That's an interesting point! As your AI study buddy, I'm here to support your academic success. I can help with study techniques, time management, or managing academic stress. Feel free to share more details about what you're experiencing, and I'll do my best to provide personalized advice. What specific challenges are you facing right now?";
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hello! I'm your AI study buddy. How can I help you with your academic goals today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getTasks } = useTask();
  
  const pendingTasks = getTasks({ completed: false });
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      text: inputMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    // Simulate bot typing
    setIsTyping(true);
    
    // Add bot response after a delay
    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot' as const,
        text: getBotResponse(inputMessage),
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: "Hello! I'm your AI study buddy. How can I help you with your academic goals today?",
        timestamp: new Date(),
      },
    ]);
  };
  
  const usePrompt = (prompt: string) => {
    setInputMessage(prompt);
  };
  
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 lg:max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bot className="text-garden-purple" /> AI Study Buddy
              </h1>
              <p className="text-gray-500">
                Your personal assistant for academic success and emotional support
              </p>
            </motion.div>
            
            <Card className="h-[calc(100vh-220px)] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Chat with Study Buddy</CardTitle>
                    <CardDescription>
                      Ask questions about studying, time management, or just chat
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={clearChat}
                    title="Clear chat history"
                  >
                    <RotateCcw size={18} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-hidden px-4">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4 mb-2">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === 'user'
                              ? 'bg-garden-green text-white'
                              : 'bg-garden-light'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {message.sender === 'bot' ? (
                              <Bot size={16} className="text-garden-purple" />
                            ) : (
                              <User size={16} />
                            )}
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg p-3 bg-garden-light">
                          <div className="flex items-center gap-2 mb-1">
                            <Bot size={16} className="text-garden-purple" />
                            <span className="text-xs opacity-70">Now</span>
                          </div>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
              
              <CardFooter className="pt-3">
                <div className="flex gap-2 w-full">
                  <Input
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} className="shrink-0">
                    <Send size={18} />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div className="lg:w-80 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Try asking about...</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2">
                    {suggestedPrompts.map((prompt, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-md bg-garden-light text-sm cursor-pointer hover:bg-garden-purple hover:bg-opacity-10"
                        onClick={() => usePrompt(prompt)}
                      >
                        {prompt}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb size={16} className="text-garden-orange" />
                    Study Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2 pb-3">
                  <p>• Break tasks into 25-minute focus sessions</p>
                  <p>• Review notes within 24 hours to improve retention</p>
                  <p>• Use active recall instead of passive re-reading</p>
                  <p>• Stay hydrated and take movement breaks</p>
                  <p>• Try explaining concepts to reinforce learning</p>
                </CardContent>
              </Card>
            </motion.div>
            
            {pendingTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Upcoming Tasks</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-2">
                      {pendingTasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="text-sm flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-garden-green"></div>
                          <span className="truncate">{task.title}</span>
                        </div>
                      ))}
                      {pendingTasks.length > 3 && (
                        <div className="text-xs text-center text-gray-500 pt-1">
                          And {pendingTasks.length - 3} more tasks
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Chat;
