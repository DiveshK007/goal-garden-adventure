
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, RotateCcw, PlusCircle, Lightbulb, BookOpen, Calendar, Coffee, Brain } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTask } from "@/contexts/TaskContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  category?: string;
}

const suggestedPrompts = {
  study: [
    "I'm feeling overwhelmed with my workload. Can you help me plan?",
    "How can I improve my study habits?",
    "I'm procrastinating too much. Any advice?",
    "What's a good way to balance school and extracurriculars?",
    "I'm stressed about my upcoming exam. Any tips?",
  ],
  productivity: [
    "How can I use the Pomodoro technique effectively?",
    "What are some ways to improve my focus during study sessions?",
    "Can you suggest a study schedule for balancing multiple subjects?",
    "How do I avoid distractions while studying?",
    "What tools can help me track my productivity?",
  ],
  wellbeing: [
    "I'm feeling burnt out. What should I do?",
    "How can I incorporate mindfulness into my daily routine?",
    "What are some quick stress relief techniques for students?",
    "I'm having trouble sleeping because of study anxiety. Any advice?",
    "How can I maintain a healthy work-life balance as a student?",
  ],
}; 

// Topic-based responses for the AI buddy
const getBotResponse = (message: string): { text: string; category?: string } => {
  message = message.toLowerCase();

  // Study-related responses
  if (message.includes("overwhelm") || message.includes("workload") || message.includes("too much")) {
    return {
      text: "I understand feeling overwhelmed can be tough. Let's break down your workload into smaller, manageable tasks. Try listing everything you need to do, then prioritize them based on deadlines and importance. Focus on one task at a time, and remember to schedule short breaks to avoid burnout. Would you like me to help you create a study schedule?",
      category: "study"
    };
  }
  
  if (message.includes("study habit") || message.includes("focus") || message.includes("concentrate")) {
    return {
      text: "Improving study habits takes practice! Try the Pomodoro technique: study for 25 minutes, then take a 5-minute break. Find a quiet environment with minimal distractions. Consider using active learning methods like teaching concepts to yourself or making flashcards. Also, proper sleep, nutrition, and exercise significantly impact your ability to focus and retain information. What specific aspect of studying would you like to improve?",
      category: "study"
    };
  }
  
  if (message.includes("procrastinat")) {
    return {
      text: "Procrastination happens to everyone! Try breaking tasks into smaller, less intimidating chunks. Set specific goals with deadlines, and reward yourself when you complete them. Remove distractions like your phone when studying. Sometimes starting is the hardest part—try committing to just 5 minutes of work, and you'll often find yourself continuing once you've begun. Would you like more specific strategies?",
      category: "productivity"
    };
  }
  
  if (message.includes("balance") || message.includes("extracurricular")) {
    return {
      text: "Balancing academics and extracurriculars requires good time management. Use a planner or calendar to schedule everything, including study time and activities. Be realistic about how much you can handle, and don't be afraid to say no to additional commitments if you're already stretched thin. Quality often matters more than quantity, so focus on excelling in fewer activities rather than spreading yourself too thin. How many extracurricular activities are you currently involved in?",
      category: "productivity"
    };
  }
  
  // Wellbeing-related responses
  if (message.includes("stress") || message.includes("anxious") || message.includes("anxiety")) {
    return {
      text: "I'm sorry to hear you're feeling stressed. Anxiety is a normal response, but there are many ways to manage it. Try deep breathing exercises - inhale for 4 counts, hold for 4, and exhale for 6. Regular physical activity, even just a short walk, can reduce stress hormones. Mindfulness meditation, even for just 5 minutes daily, has been proven to lower anxiety levels. Would you like me to guide you through a quick relaxation exercise right now?",
      category: "wellbeing"
    };
  }
  
  if (message.includes("sleep") || message.includes("tired") || message.includes("rest")) {
    return {
      text: "Getting quality sleep is crucial for academic performance! Try to maintain a consistent sleep schedule, even on weekends. Avoid screens at least 30 minutes before bed as blue light disrupts melatonin production. Create a relaxing bedtime routine, and make sure your sleep environment is dark, quiet, and cool. If racing thoughts keep you awake, try writing them down in a journal before bed to clear your mind. How many hours of sleep do you typically get?",
      category: "wellbeing"
    };
  }
  
  // Exam-specific responses
  if (message.includes("exam") || message.includes("test") || message.includes("quiz")) {
    return {
      text: "Exam stress is completely normal. Ensure you're preparing effectively—create a study schedule, use active recall techniques, and take care of your wellbeing. Get enough sleep before the exam rather than pulling all-nighters. Practice deep breathing or mindfulness exercises when feeling anxious. Remember, one exam doesn't define your worth or intelligence. Focus on doing your best rather than achieving perfection. Would you like some relaxation techniques to try before your exam?",
      category: "study"
    };
  }
  
  // Productivity responses
  if (message.includes("pomodoro") || message.includes("time manage")) {
    return {
      text: "The Pomodoro Technique is great for productivity! Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break. This method helps maintain focus while preventing burnout. Use a timer to keep yourself accountable, and during breaks, step away from your work area completely. What task are you planning to tackle with this technique?",
      category: "productivity"
    };
  }
  
  // Greeting responses
  if (message.includes("hi") || message.includes("hello") || message.includes("hey")) {
    return {
      text: "Hello! I'm your AI study buddy. How can I help you today with your academic journey? Feel free to ask me about study techniques, time management, or anything else related to your education!",
      category: "general"
    };
  }
  
  // Default response if no patterns match
  return {
    text: "That's an interesting point! As your AI study buddy, I'm here to support your academic success. I can help with study techniques, time management, or managing academic stress. Feel free to share more details about what you're experiencing, and I'll do my best to provide personalized advice. What specific challenges are you facing right now?",
    category: "general"
  };
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hello! I'm your AI study buddy. How can I help you with your academic goals today?",
      timestamp: new Date(),
      category: 'general'
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getTasks } = useTask();
  const [activeTopicTab, setActiveTopicTab] = useState<string>("study");
  
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
      const response = getBotResponse(inputMessage);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot' as const,
        text: response.text,
        timestamp: new Date(),
        category: response.category
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
        category: 'general'
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
              <p className="text-gray-500 dark:text-gray-400">
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
                              ? 'bg-garden-green text-white dark:bg-garden-purple'
                              : 'bg-garden-light dark:bg-gray-800'
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
                            {message.category && message.sender === 'bot' && (
                              <Badge variant="outline" className="text-xs">
                                {message.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg p-3 bg-garden-light dark:bg-gray-800">
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
                  <CardTitle className="text-base flex items-center gap-2">Try asking about...</CardTitle>
                  <div className="mt-2">
                    <ToggleGroup type="single" value={activeTopicTab} onValueChange={(val) => val && setActiveTopicTab(val)}>
                      <ToggleGroupItem value="study" aria-label="Study tips">
                        <BookOpen size={16} className="mr-1" /> Study
                      </ToggleGroupItem>
                      <ToggleGroupItem value="productivity" aria-label="Productivity">
                        <Calendar size={16} className="mr-1" /> Productivity
                      </ToggleGroupItem>
                      <ToggleGroupItem value="wellbeing" aria-label="Wellbeing">
                        <Coffee size={16} className="mr-1" /> Wellbeing
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2">
                    {suggestedPrompts[activeTopicTab as keyof typeof suggestedPrompts].map((prompt, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-md bg-garden-light text-sm cursor-pointer hover:bg-garden-purple hover:bg-opacity-10 dark:bg-gray-800 dark:hover:bg-opacity-50"
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
                          <div className="w-2 h-2 rounded-full bg-garden-green dark:bg-garden-purple"></div>
                          <span className="truncate">{task.title}</span>
                        </div>
                      ))}
                      {pendingTasks.length > 3 && (
                        <div className="text-xs text-center text-gray-500 pt-1 dark:text-gray-400">
                          And {pendingTasks.length - 3} more tasks
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain size={16} className="text-garden-purple" />
                    Learning Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3 pb-3">
                  <div className="p-2 border rounded-md">
                    <p className="font-medium">Spaced Repetition</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Review material at increasing intervals for better retention</p>
                  </div>
                  <div className="p-2 border rounded-md">
                    <p className="font-medium">Cornell Note-Taking</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Organized note structure with cues, notes, and summary</p>
                  </div>
                  <div className="p-2 border rounded-md">
                    <p className="font-medium">Mind Mapping</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Visual organization of information showing relationships</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Chat;
