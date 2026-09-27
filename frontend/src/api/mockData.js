// Mock database and helpers for localStorage persistence

// 1. Coding Problems
export const MOCK_PROBLEMS = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "EASY",
    category: "DSA",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    constraints: "- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9",
    template: `function twoSum(nums, target) {\n    // Write your code here\n    \n}`,
    testCases: [
      { input: "[2,7,11,15], 9", expected: "[0,1]" },
      { input: "[3,2,4], 6", expected: "[1,2]" }
    ],
    solved: false
  },
  {
    id: 2,
    title: "Reverse Linked List",
    difficulty: "MEDIUM",
    category: "DSA",
    description: "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
    constraints: "The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000",
    template: `class ListNode {\n    constructor(val, next = null) {\n        this.val = val;\n        this.next = next;\n    }\n}\n\nfunction reverseList(head) {\n    // Write your code here\n    \n}`,
    testCases: [
      { input: "[1,2,3,4,5]", expected: "[5,4,3,2,1]" }
    ],
    solved: false
  },
  {
    id: 3,
    title: "Validate Binary Search Tree",
    difficulty: "HARD",
    category: "DSA",
    description: "Given the `root` of a binary tree, determine if it is a valid binary search tree (BST).",
    constraints: "The number of nodes in the tree is in the range [1, 10^4].\n-2^31 <= Node.val <= 2^31 - 1",
    template: `function isValidBST(root) {\n    // Write your code here\n    \n}`,
    testCases: [
      { input: "[2,1,3]", expected: "true" }
    ],
    solved: false
  },
  {
    id: 4,
    title: "Find Duplicate Users",
    difficulty: "EASY",
    category: "SQL",
    description: "Write a SQL query to find all duplicate emails in a table named `Person`.",
    constraints: "Email table schema: (id INT, email VARCHAR(255))",
    template: `SELECT email FROM Person\n-- Write your query here\n`,
    testCases: [
      { input: "Person table with duplicate emails", expected: "List of duplicate emails" }
    ],
    solved: false
  },
  {
    id: 5,
    title: "Singleton Design Pattern",
    difficulty: "MEDIUM",
    category: "System Design",
    description: "Design a thread-safe Singleton pattern in Java/JavaScript that prevents double instantiation.",
    constraints: "Ensure concurrent thread calls receive the same instance.",
    template: `class Singleton {\n    constructor() {\n        if (Singleton.instance) {\n            return Singleton.instance;\n        }\n        // Initialize properties\n        Singleton.instance = this;\n    }\n}`,
    testCases: [
      { input: "new Singleton() === new Singleton()", expected: "true" }
    ],
    solved: false
  }
];

// 2. Roadmaps
export const MOCK_ROADMAPS = {
  "Full Stack": [
    { id: "fs1", title: "HTML, CSS & Responsive Design", description: "Semantic markup, CSS Grid/Flexbox, media queries", progress: "Completed" },
    { id: "fs2", title: "JavaScript Fundamentals", description: "ES6+, Event Loop, DOM manipulation, Async/Await", progress: "In Progress" },
    { id: "fs3", title: "React & State Management", description: "Components, hooks, context API, Redux/Zustand", progress: "Not Started" },
    { id: "fs4", title: "Node.js & Express REST APIs", description: "Routing, middleware, database connection", progress: "Not Started" },
    { id: "fs5", title: "SQL & NoSQL Databases", description: "PostgreSQL schema design and MongoDB aggregations", progress: "Not Started" },
    { id: "fs6", title: "System Integration & Cloud Deployment", description: "Docker, Nginx, hosting on AWS/Render", progress: "Not Started" }
  ],
  "Java Developer": [
    { id: "j1", title: "Java OOP Core Concepts", description: "Classes, objects, inheritance, polymorphism, encapsulation, abstraction", progress: "Completed" },
    { id: "j2", title: "Java Collections Framework", description: "Lists, Sets, Maps, queues, and performance complexities", progress: "In Progress" },
    { id: "j3", title: "Multithreading & Concurrency", description: "Runnable, threads, locks, executor framework", progress: "Not Started" },
    { id: "j4", title: "Spring Framework & Boot", description: "Dependency injection, MVC, REST APIs", progress: "Not Started" },
    { id: "j5", title: "Hibernate & JPA Data layer", description: "Entity mappings, queries, transaction management", progress: "Not Started" },
    { id: "j6", title: "Microservices Architecture", description: "Eureka, API Gateway, communication methods", progress: "Not Started" }
  ],
  "AI-ML Engineer": [
    { id: "ai1", title: "Python for Data Science", description: "NumPy, Pandas, Matplotlib, exploratory data analysis", progress: "Completed" },
    { id: "ai2", title: "Mathematics for ML", description: "Linear algebra, calculus, probability & statistics", progress: "In Progress" },
    { id: "ai3", title: "Supervised & Unsupervised Learning", description: "Regression, classification, clustering with scikit-learn", progress: "Not Started" },
    { id: "ai4", title: "Neural Networks & Deep Learning", description: "Perceptrons, backpropagation, CNNs, RNNs in PyTorch/TensorFlow", progress: "Not Started" },
    { id: "ai5", title: "Natural Language Processing & LLMs", description: "Tokenization, Transformers, HuggingFace, prompt engineering", progress: "Not Started" }
  ]
};

// 3. Badges / Achievements
export const MOCK_ACHIEVEMENTS = [
  { id: "a1", title: "Hello World", description: "Created an account on PrepEdge", xp: 100, earned: true, icon: "Zap" },
  { id: "a2", title: "Quiz Master", description: "Completed 5 quizzes successfully", xp: 300, earned: false, icon: "BookOpen" },
  { id: "a3", title: "Code Warrior", description: "Submit a correct solution to a coding problem", xp: 250, earned: false, icon: "Code" },
  { id: "a4", title: "Perfect Interview", description: "Score an 8/10 or higher in a Mock Interview", xp: 400, earned: false, icon: "Mic" },
  { id: "a5", title: "ATS Optimizer", description: "Get a Resume ATS score above 85%", xp: 300, earned: false, icon: "FileText" },
  { id: "a6", title: "Streak Titan", description: "Reach a 5-day preparation streak", xp: 500, earned: false, icon: "TrendingUp" }
];

// 4. Companies
export const MOCK_COMPANIES = [
  {
    name: "Google",
    logoColor: "#4285f4",
    difficulty: "HARD",
    rounds: {
      aptitude: "Aptitude testing (probability, logic, puzzles)",
      coding: "2 rounds of advanced DS & Algorithms (Graphs, Trees, DP)",
      technical: "Systems Design, Operating Systems, Networks, OOP",
      hr: "Googliness & Leadership values interview"
    }
  },
  {
    name: "Amazon",
    logoColor: "#ff9900",
    difficulty: "HARD",
    rounds: {
      aptitude: "Aptitude testing + work simulation assessment",
      coding: "Data structures questions (Strings, Trees, Heaps) and complex complexity analysis",
      technical: "AWS framework, Object-Oriented design, DBMS internals",
      hr: "Leadership Principles detailed scenarios"
    }
  },
  {
    name: "TCS",
    logoColor: "#1a5b8c",
    difficulty: "EASY",
    rounds: {
      aptitude: "TCS NQT style quantitative and logical reasoning tests",
      coding: "Simple programs (Prime numbers, Matrix rotation, String processing)",
      technical: "Standard academic questions from DBMS, Java, C/C++ or Python",
      hr: "Standard HR questions about relocation, college projects, and background"
    }
  },
  {
    name: "Microsoft",
    logoColor: "#f25022",
    difficulty: "HARD",
    rounds: {
      aptitude: "Online coding + logical reasoning screening",
      coding: "Optimal coding implementations, arrays, linked lists, binary trees",
      technical: "OS concepts, thread pools, memory layouts",
      hr: "Collaborative teamwork questions and behavioral alignment"
    }
  }
];

// LocalStorage Helper functions
export const getLocalData = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
};

export const setLocalData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const initializeState = () => {
  // Streak
  getLocalData("streak", { count: 3, lastActive: new Date().toDateString() });
  // Coding
  getLocalData("problems", MOCK_PROBLEMS);
  // Achievements
  getLocalData("achievements", MOCK_ACHIEVEMENTS);
  // Goals
  getLocalData("goals", [
    { id: 1, text: "Practice one coding problem", completed: false },
    { id: 2, text: "Analyze your resume score", completed: false },
    { id: 3, text: "Try a system design mock quiz", completed: false }
  ]);
  // Roadmaps
  getLocalData("roadmaps", MOCK_ROADMAPS);
  getLocalData("selected_role", "Java Developer");
  // Notifications
  getLocalData("notifications", [
    { id: 1, title: "Keep it up!", text: "You have a 3-day streak active. Complete a goal today!", read: false, time: "2 hours ago" },
    { id: 2, title: "Weakness Detected", text: "AI noticed weakness in SQL queries. Try the DBMS quiz!", read: false, time: "1 day ago" }
  ]);
};
