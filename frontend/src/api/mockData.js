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

// 2. Roadmaps — detailed topic metadata
export const ROADMAP_TOPIC_DETAILS = {
  // ── Full Stack ──────────────────────────────────────────────────
  "fs1": {
    skills: ["HTML5 Semantics", "CSS Grid", "Flexbox", "Media Queries", "Accessibility"],
    objectives: [
      "Write semantic, accessible HTML markup",
      "Build responsive layouts using CSS Grid and Flexbox",
      "Apply mobile-first design principles",
      "Use CSS custom properties and animations"
    ],
    estimatedTime: "2 weeks",
    featureLink: null,
    featureLinkLabel: null,
    subtopics: [
      { id: "fs1_s1", title: "Semantic HTML elements (header, main, article, section)" },
      { id: "fs1_s2", title: "CSS Box Model & specificity" },
      { id: "fs1_s3", title: "Flexbox layout patterns" },
      { id: "fs1_s4", title: "CSS Grid — rows, columns, areas" },
      { id: "fs1_s5", title: "Media queries & mobile-first design" },
      { id: "fs1_s6", title: "CSS animations & transitions" }
    ]
  },
  "fs2": {
    skills: ["ES6+", "DOM Manipulation", "Event Loop", "Promises", "Async/Await", "Closures"],
    objectives: [
      "Understand JavaScript's event loop and call stack",
      "Write modern ES6+ code with arrow functions, destructuring, spread",
      "Handle asynchronous operations with Promises and Async/Await",
      "Manipulate the DOM and handle browser events"
    ],
    estimatedTime: "3 weeks",
    featureLink: "/quizzes",
    featureLinkLabel: "Practice with JS Quizzes",
    subtopics: [
      { id: "fs2_s1", title: "Variables, scope, hoisting & closures" },
      { id: "fs2_s2", title: "Arrow functions, destructuring, spread/rest" },
      { id: "fs2_s3", title: "DOM selection & manipulation" },
      { id: "fs2_s4", title: "Event listeners & bubbling/capturing" },
      { id: "fs2_s5", title: "Promises & the microtask queue" },
      { id: "fs2_s6", title: "Async/Await & error handling" },
      { id: "fs2_s7", title: "Modules (import/export)" }
    ]
  },
  "fs3": {
    skills: ["React", "JSX", "Hooks", "Context API", "State Management"],
    objectives: [
      "Build component-based UIs with React",
      "Manage local and global state with hooks and Context API",
      "Understand React's reconciliation and rendering lifecycle",
      "Optimize performance with useMemo and useCallback"
    ],
    estimatedTime: "4 weeks",
    featureLink: "/quizzes",
    featureLinkLabel: "Test React Knowledge",
    subtopics: [
      { id: "fs3_s1", title: "JSX syntax and component basics" },
      { id: "fs3_s2", title: "useState & useEffect hooks" },
      { id: "fs3_s3", title: "Props, prop drilling, and lifting state" },
      { id: "fs3_s4", title: "Context API for global state" },
      { id: "fs3_s5", title: "useRef, useMemo, useCallback" },
      { id: "fs3_s6", title: "React Router for navigation" },
      { id: "fs3_s7", title: "Introduction to Redux / Zustand" }
    ]
  },
  "fs4": {
    skills: ["Node.js", "Express", "REST APIs", "Middleware", "JWT Auth"],
    objectives: [
      "Build RESTful APIs with Express.js",
      "Implement authentication using JWT",
      "Use middleware for validation and error handling",
      "Connect to databases from a Node.js backend"
    ],
    estimatedTime: "3 weeks",
    featureLink: "/quizzes",
    featureLinkLabel: "Backend Quiz Challenge",
    subtopics: [
      { id: "fs4_s1", title: "Node.js runtime & npm ecosystem" },
      { id: "fs4_s2", title: "Express routing and controllers" },
      { id: "fs4_s3", title: "Middleware — logging, validation, error handling" },
      { id: "fs4_s4", title: "REST conventions (CRUD, status codes)" },
      { id: "fs4_s5", title: "JWT authentication & authorization" },
      { id: "fs4_s6", title: "Environment configuration & dotenv" }
    ]
  },
  "fs5": {
    skills: ["SQL", "PostgreSQL", "MongoDB", "Schema Design", "Aggregations"],
    objectives: [
      "Design normalized relational schemas in SQL",
      "Write complex queries with JOINs, subqueries, and window functions",
      "Use MongoDB for document-based storage",
      "Choose the right database for the task"
    ],
    estimatedTime: "3 weeks",
    featureLink: "/quizzes",
    featureLinkLabel: "SQL Quiz Challenge",
    subtopics: [
      { id: "fs5_s1", title: "Relational model & normalization (1NF–3NF)" },
      { id: "fs5_s2", title: "SQL CRUD, JOINs, subqueries" },
      { id: "fs5_s3", title: "Indexes, transactions, ACID" },
      { id: "fs5_s4", title: "MongoDB documents & collections" },
      { id: "fs5_s5", title: "Mongoose schemas & aggregation pipeline" }
    ]
  },
  "fs6": {
    skills: ["Docker", "Nginx", "CI/CD", "Cloud Deployment", "AWS / Render"],
    objectives: [
      "Containerize applications with Docker",
      "Set up Nginx as a reverse proxy",
      "Understand CI/CD pipelines",
      "Deploy full-stack apps to cloud platforms"
    ],
    estimatedTime: "2 weeks",
    featureLink: "/mock-interview",
    featureLinkLabel: "System Design Interview Practice",
    subtopics: [
      { id: "fs6_s1", title: "Docker images, containers & docker-compose" },
      { id: "fs6_s2", title: "Nginx reverse proxy & SSL" },
      { id: "fs6_s3", title: "GitHub Actions for CI/CD" },
      { id: "fs6_s4", title: "Deploying to Render / AWS EC2" },
      { id: "fs6_s5", title: "Environment variables & secrets management" }
    ]
  },
  // ── Java Developer ───────────────────────────────────────────────
  "j1": {
    skills: ["OOP", "Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
    objectives: [
      "Understand and apply the four pillars of OOP",
      "Design class hierarchies with proper inheritance",
      "Use interfaces and abstract classes effectively",
      "Apply SOLID principles in code design"
    ],
    estimatedTime: "2 weeks",
    featureLink: "/quizzes",
    featureLinkLabel: "OOP Java Quiz",
    subtopics: [
      { id: "j1_s1", title: "Classes, objects & constructors" },
      { id: "j1_s2", title: "Inheritance & method overriding" },
      { id: "j1_s3", title: "Interfaces vs abstract classes" },
      { id: "j1_s4", title: "Encapsulation — getters/setters, access modifiers" },
      { id: "j1_s5", title: "Polymorphism — compile-time and runtime" },
      { id: "j1_s6", title: "SOLID principles overview" }
    ]
  },
  "j2": {
    skills: ["ArrayList", "LinkedList", "HashMap", "HashSet", "TreeMap", "Queue", "Deque"],
    objectives: [
      "Choose the right collection for each use case",
      "Understand time and space complexity of operations",
      "Iterate collections with streams and lambdas",
      "Implement custom comparators for sorting"
    ],
    estimatedTime: "2 weeks",
    featureLink: "/quizzes",
    featureLinkLabel: "Collections Quiz",
    subtopics: [
      { id: "j2_s1", title: "List interface — ArrayList vs LinkedList" },
      { id: "j2_s2", title: "Set interface — HashSet, TreeSet, LinkedHashSet" },
      { id: "j2_s3", title: "Map interface — HashMap, TreeMap, LinkedHashMap" },
      { id: "j2_s4", title: "Queue & Deque — PriorityQueue, ArrayDeque" },
      { id: "j2_s5", title: "Java Streams & lambda expressions" },
      { id: "j2_s6", title: "Comparator vs Comparable" }
    ]
  },
  "j3": {
    skills: ["Threads", "Runnable", "Synchronized", "ReentrantLock", "ExecutorService", "CompletableFuture"],
    objectives: [
      "Create and manage threads in Java",
      "Prevent race conditions with synchronization",
      "Use the Executor framework for thread pooling",
      "Write non-blocking code with CompletableFuture"
    ],
    estimatedTime: "3 weeks",
    featureLink: "/mock-interview",
    featureLinkLabel: "Concurrency Interview Practice",
    subtopics: [
      { id: "j3_s1", title: "Thread lifecycle & creating threads" },
      { id: "j3_s2", title: "Runnable vs Callable" },
      { id: "j3_s3", title: "Synchronized blocks & intrinsic locks" },
      { id: "j3_s4", title: "ReentrantLock, ReadWriteLock" },
      { id: "j3_s5", title: "ExecutorService & thread pools" },
      { id: "j3_s6", title: "CompletableFuture & async pipelines" }
    ]
  },
  "j4": {
    skills: ["Spring IoC", "Dependency Injection", "Spring MVC", "Spring Boot", "REST Controllers"],
    objectives: [
      "Understand Spring's inversion of control container",
      "Build REST APIs with Spring Boot",
      "Configure Spring applications with properties and profiles",
      "Write integration tests for Spring components"
    ],
    estimatedTime: "4 weeks",
    featureLink: "/mock-interview",
    featureLinkLabel: "Spring Interview Practice",
    subtopics: [
      { id: "j4_s1", title: "Spring Core — IoC container & beans" },
      { id: "j4_s2", title: "Dependency injection — @Autowired, @Component" },
      { id: "j4_s3", title: "Spring Boot auto-configuration" },
      { id: "j4_s4", title: "REST controllers & request mapping" },
      { id: "j4_s5", title: "Exception handling with @ControllerAdvice" },
      { id: "j4_s6", title: "Spring Security basics & JWT filter" },
      { id: "j4_s7", title: "Testing with @SpringBootTest & MockMvc" }
    ]
  },
  "j5": {
    skills: ["JPA", "Hibernate", "JPQL", "Entity Mapping", "Transactions"],
    objectives: [
      "Map Java entities to database tables with JPA annotations",
      "Write JPQL and Criteria API queries",
      "Manage transactions and understand isolation levels",
      "Optimize queries to avoid N+1 problems"
    ],
    estimatedTime: "3 weeks",
    featureLink: "/quizzes",
    featureLinkLabel: "JPA & SQL Quiz",
    subtopics: [
      { id: "j5_s1", title: "JPA entity annotations (@Entity, @Id, @Column)" },
      { id: "j5_s2", title: "Relationships — @OneToMany, @ManyToOne, @ManyToMany" },
      { id: "j5_s3", title: "JPQL and named queries" },
      { id: "j5_s4", title: "Spring Data JPA repositories" },
      { id: "j5_s5", title: "Transaction management & @Transactional" },
      { id: "j5_s6", title: "Lazy vs eager loading & N+1 fix" }
    ]
  },
  "j6": {
    skills: ["Microservices", "Spring Cloud", "Eureka", "API Gateway", "Docker", "Kafka"],
    objectives: [
      "Break monoliths into independent microservices",
      "Implement service discovery with Eureka",
      "Route requests through an API Gateway",
      "Communicate between services using REST and messaging"
    ],
    estimatedTime: "4 weeks",
    featureLink: "/mock-interview",
    featureLinkLabel: "System Design Interview Practice",
    subtopics: [
      { id: "j6_s1", title: "Microservices principles & bounded context" },
      { id: "j6_s2", title: "Spring Cloud Netflix Eureka" },
      { id: "j6_s3", title: "API Gateway pattern with Spring Cloud Gateway" },
      { id: "j6_s4", title: "Inter-service REST communication with Feign" },
      { id: "j6_s5", title: "Asynchronous messaging with Kafka" },
      { id: "j6_s6", title: "Containerizing services with Docker Compose" }
    ]
  },
  // ── AI-ML Engineer ───────────────────────────────────────────────
  "ai1": {
    skills: ["Python", "NumPy", "Pandas", "Matplotlib", "Seaborn", "EDA"],
    objectives: [
      "Manipulate arrays and data frames efficiently",
      "Perform exploratory data analysis on real datasets",
      "Visualize distributions, correlations, and trends",
      "Write clean, idiomatic Python code"
    ],
    estimatedTime: "2 weeks",
    featureLink: "/quizzes",
    featureLinkLabel: "Python & Data Science Quiz",
    subtopics: [
      { id: "ai1_s1", title: "Python data types, list/dict comprehensions" },
      { id: "ai1_s2", title: "NumPy arrays — indexing, broadcasting, operations" },
      { id: "ai1_s3", title: "Pandas DataFrames — load, clean, transform" },
      { id: "ai1_s4", title: "GroupBy, merge, pivot tables" },
      { id: "ai1_s5", title: "Matplotlib & Seaborn visualizations" },
      { id: "ai1_s6", title: "Exploratory data analysis workflow" }
    ]
  },
  "ai2": {
    skills: ["Linear Algebra", "Calculus", "Probability", "Statistics", "Optimization"],
    objectives: [
      "Understand vectors, matrices and their operations",
      "Apply calculus concepts to gradient descent",
      "Work with probability distributions and Bayes' theorem",
      "Interpret statistical tests and confidence intervals"
    ],
    estimatedTime: "3 weeks",
    featureLink: "/ai-coach",
    featureLinkLabel: "Ask AI Coach for Help",
    subtopics: [
      { id: "ai2_s1", title: "Vectors, matrices & matrix multiplication" },
      { id: "ai2_s2", title: "Eigenvalues, eigenvectors & PCA intuition" },
      { id: "ai2_s3", title: "Derivatives, partial derivatives & chain rule" },
      { id: "ai2_s4", title: "Gradient descent & learning rates" },
      { id: "ai2_s5", title: "Probability distributions — Bernoulli, Gaussian, Poisson" },
      { id: "ai2_s6", title: "Bayes' theorem & conditional probability" },
      { id: "ai2_s7", title: "Hypothesis testing, p-values, confidence intervals" }
    ]
  },
  "ai3": {
    skills: ["scikit-learn", "Linear Regression", "Classification", "Clustering", "Cross-validation"],
    objectives: [
      "Train and evaluate supervised learning models",
      "Apply clustering techniques for unsupervised tasks",
      "Use cross-validation to prevent overfitting",
      "Tune hyperparameters with grid and random search"
    ],
    estimatedTime: "4 weeks",
    featureLink: "/quizzes",
    featureLinkLabel: "ML Concepts Quiz",
    subtopics: [
      { id: "ai3_s1", title: "Linear & logistic regression from scratch" },
      { id: "ai3_s2", title: "Decision trees & random forests" },
      { id: "ai3_s3", title: "Support Vector Machines" },
      { id: "ai3_s4", title: "K-Means & DBSCAN clustering" },
      { id: "ai3_s5", title: "Model evaluation metrics (precision, recall, F1, ROC-AUC)" },
      { id: "ai3_s6", title: "Train/test split & k-fold cross-validation" },
      { id: "ai3_s7", title: "Hyperparameter tuning with GridSearchCV" }
    ]
  },
  "ai4": {
    skills: ["Neural Networks", "Backpropagation", "PyTorch", "CNNs", "RNNs", "Transfer Learning"],
    objectives: [
      "Understand how neural networks learn via backpropagation",
      "Build and train deep models in PyTorch or TensorFlow",
      "Apply CNNs to image tasks and RNNs to sequence tasks",
      "Use pre-trained models with transfer learning"
    ],
    estimatedTime: "5 weeks",
    featureLink: "/mock-interview",
    featureLinkLabel: "Deep Learning Interview Practice",
    subtopics: [
      { id: "ai4_s1", title: "Perceptrons, activation functions & forward pass" },
      { id: "ai4_s2", title: "Backpropagation & gradient flow" },
      { id: "ai4_s3", title: "PyTorch tensors, autograd & training loop" },
      { id: "ai4_s4", title: "CNNs — conv layers, pooling, image classification" },
      { id: "ai4_s5", title: "RNNs & LSTMs for sequence modeling" },
      { id: "ai4_s6", title: "Batch normalization & dropout" },
      { id: "ai4_s7", title: "Transfer learning with pretrained models" }
    ]
  },
  "ai5": {
    skills: ["NLP", "Tokenization", "Transformers", "BERT", "HuggingFace", "Prompt Engineering"],
    objectives: [
      "Understand text preprocessing and tokenization",
      "Explain the Transformer architecture and self-attention",
      "Fine-tune pre-trained models from HuggingFace",
      "Apply prompt engineering techniques for LLMs"
    ],
    estimatedTime: "4 weeks",
    featureLink: "/ai-coach",
    featureLinkLabel: "Explore AI Coach",
    subtopics: [
      { id: "ai5_s1", title: "Text preprocessing — tokenization, stop words, stemming" },
      { id: "ai5_s2", title: "Word embeddings — Word2Vec, GloVe" },
      { id: "ai5_s3", title: "Attention mechanism & Transformer architecture" },
      { id: "ai5_s4", title: "BERT, GPT and their variants" },
      { id: "ai5_s5", title: "HuggingFace Transformers library" },
      { id: "ai5_s6", title: "Prompt engineering — zero-shot, few-shot, chain-of-thought" },
      { id: "ai5_s7", title: "Retrieval-Augmented Generation (RAG) overview" }
    ]
  }
};

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
